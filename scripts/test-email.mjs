#!/usr/bin/env node
/**
 * Sends a sample pop-up order email (and a sample inquiry) through your Gmail SMTP settings,
 * so you can see exactly what the owner receives.
 *
 *   npm run email:test                    → sends to OWNER_EMAIL
 *   npm run email:test -- you@gmail.com   → sends to another address
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import nodemailer from 'nodemailer';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { orderEmail, inquiryEmail, receivedAt } from '../lib/email-templates.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { SMTP_USER, SMTP_PASS = '', SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = '465' } = process.env;
const to = process.argv[2] || process.env.EVENT_TO_EMAIL || process.env.OWNER_EMAIL || SMTP_USER;
if (!SMTP_USER || !SMTP_PASS) {
  console.error('✖ Add SMTP_USER (the Gmail address) and SMTP_PASS (its 16-letter App password) to .env.local first.');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') }
});
try {
  await transport.verify();
  console.log(`✓ Signed in to ${SMTP_HOST} as ${SMTP_USER}`);
} catch (e) {
  console.error(`✖ Gmail refused the login (${e.responseCode || e.code}): ${e.response || e.message}`);
  console.error('  Use an App password (myaccount.google.com/apppasswords, needs 2-Step Verification), not the normal Gmail password.');
  process.exit(1);
}

const img = f => readFile(join(ROOT, 'supabase', 'seed-media', 'img', f));
const photos = await Promise.all(['wedding-buttons.jpg', 'mirror-pink.jpg', 'weezy-pack.jpg'].map(img));
const sheet = await img('neeks-studio.jpg');
const order = {
  orderId: 'NX-000T', event: 'Test Event', bundle: 'The Trio', price: '$19.99', name: 'Test Guest',
  phone: '775-555-0123', email: SMTP_USER, note: 'This is a test order from npm run email:test',
  items: ['magnet', 'magnet', 'magnet'], shape: 'square', receivedAt: receivedAt()
};
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://neeksxart.com').replace(/\/$/, '');
const o = orderEmail(order, { photoCount: photos.length, hasSheet: true, boardUrl: `${site}/admin?event=test-event` });
await transport.sendMail({
  from: { name: 'NeeksxArt Live', address: SMTP_USER }, to, replyTo: order.email,
  subject: '[TEST] ' + o.subject, html: o.html,
  attachments: [
    ...photos.map((p, i) => ({ filename: `photo-${i + 1}.jpg`, content: p, cid: `photo${i + 1}` })),
    { filename: 'NX-000T-overview.jpg', content: sheet, cid: 'overview' },
    ...photos.map((p, i) => ({ filename: `NX-000T-0${i + 1}-magnet.jpg`, content: p }))
  ]
});
console.log(`✓ Sample pop-up order sent to ${to}`);

const logo = await img('logo-white.png');
const q = inquiryEmail({
  topic: 'Bulk / large order', name: 'Test Customer', business: 'Test Coffee Co', email: SMTP_USER, phone: '775-555-0199',
  product: 'Mirror keychains', quantity: '100 – 249', deadline: '2026-12-15', shipTo: 'Reno, NV',
  message: 'Hi! This is a test inquiry from npm run email:test.\nWe would love 150 mirror keychains for our grand opening.',
  studio: [['Product', 'Mirror Keychain'], ['Size', '3″'], ['Hardware', 'Gold'], ['Tassel', 'Pink']], receivedAt: receivedAt()
}, { hasMockup: true, hasLogo: true, logoName: 'logo.png', dashboardUrl: `${site}/admin/inquiries` });
await transport.sendMail({
  from: { name: 'NeeksxArt Website', address: SMTP_USER }, to, replyTo: SMTP_USER,
  subject: '[TEST] ' + q.subject, html: q.html,
  attachments: [
    { filename: 'mockup-inline.jpg', content: photos[1], cid: 'mockup' },
    { filename: 'merch-studio-mockup.jpg', content: photos[1] },
    { filename: 'logo.png', content: logo }
  ]
});
console.log(`✓ Sample website inquiry sent to ${to}\nCheck the inbox (and Spam the first time).`);

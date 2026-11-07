// Contact, bulk-order and event-quote forms.
// 1. logo + Merch Studio mockup → Supabase Storage (private bucket `customer-uploads`)
// 2. inquiry → `inquiries` table (visible at /admin/inquiries)
// 3. email notification via Resend (attachments included)
import { NextResponse } from 'next/server';
import { supabaseAdmin, decodeDataUrl, BUCKETS } from '@/lib/supabase/admin';
import { sendEmail, emailConfigured, siteUrl } from '@/lib/email';
import { inquiryEmail, receivedAt } from '@/lib/email-templates';

export const runtime = 'nodejs';

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { b = {}; }
  b = b || {};
  if (b.company_site) return NextResponse.json({ ok: true }); // honeypot

  const name = clean(b.name, 120), email = clean(b.email, 200), message = clean(b.message, 5000);
  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Missing name, email or message' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  if (!sb && !emailConfigured()) {
    return NextResponse.json({ ok: false, error: 'The form is not configured yet' }, { status: 500 });
  }

  const record = {
    source: b.source === 'quote' || b.topic === 'Event quote request' ? 'quote' : 'contact',
    topic: clean(b.topic, 120) || 'General question',
    name, email,
    phone: clean(b.phone, 60) || null,
    business: clean(b.business, 200) || null,
    product: clean(b.product, 300) || null,
    quantity: clean(b.quantity, 60) || null,
    deadline: clean(b.deadline, 60) || null,
    ship_to: clean(b.shipTo, 300) || null,
    message,
    studio: Array.isArray(b.studio) ? b.studio.slice(0, 30).map(([k, v]) => [clean(k, 60), clean(v, 300)]) : null
  };

  const mock = decodeDataUrl(b.mockup);
  const logo = b.logo && decodeDataUrl(b.logo.data);
  const logoName = logo ? String(b.logo.name || `logo.${logo.ext}`).replace(/[^\w.\-]+/g, '_').slice(0, 80) : null;

  // ---- save to Supabase ----
  let saved = false, id = null;
  if (sb) {
    id = crypto.randomUUID();
    const folder = `inquiries/${new Date().toISOString().slice(0, 7)}/${id}`;
    const put = async (path, file) => {
      const { error } = await sb.storage.from(BUCKETS.uploads).upload(path, file.buffer, { contentType: file.contentType, upsert: true });
      if (error) { console.error('upload', path, error); return null; }
      return path;
    };
    record.mockup_path = mock ? await put(`${folder}/studio-mockup.${mock.ext}`, mock) : null;
    record.logo_path = logo ? await put(`${folder}/${logoName}`, logo) : null;
    const { error } = await sb.from('inquiries').insert({ id, ...record });
    if (error) console.error('insert inquiry', error);
    else saved = true;
  }

  // ---- email ----
  const attachments = [];
  if (mock) {
    attachments.push({ filename: `mockup-inline.${mock.ext}`, content: mock.buffer, contentType: mock.contentType, cid: 'mockup' });
    attachments.push({ filename: `merch-studio-mockup.${mock.ext}`, content: mock.buffer, contentType: mock.contentType });
  }
  if (logo) attachments.push({ filename: logoName, content: logo.buffer, contentType: logo.contentType });
  const { subject, html } = inquiryEmail(
    { topic: record.topic, name, business: record.business, email, phone: record.phone, product: record.product,
      quantity: record.quantity, deadline: record.deadline, shipTo: record.ship_to, message, studio: record.studio, receivedAt: receivedAt() },
    { hasMockup: !!mock, hasLogo: !!logo, logoName, dashboardUrl: saved ? `${siteUrl()}/admin/inquiries` : null }
  );
  const mail = await sendEmail({ subject, html, replyTo: email, attachments });

  if (!saved && !mail.sent) {
    return NextResponse.json({ ok: false, error: 'Could not deliver the message' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id });
}

import 'server-only';
import nodemailer from 'nodemailer';

/*
 * Email notifications through Gmail SMTP.
 *   SMTP_USER   the Gmail address that sends (e.g. neeksxart@gmail.com)
 *   SMTP_PASS   a 16-character Google "App password" (not the normal Gmail password)
 *   OWNER_EMAIL where orders + inquiries go (comma-separate for several); defaults to SMTP_USER
 *   EVENT_TO_EMAIL  optional: different inbox for pop-up orders
 *   SMTP_HOST / SMTP_PORT  optional, default smtp.gmail.com : 465
 */

export const esc = (s = '') =>
  String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ownerInbox = () => process.env.OWNER_EMAIL || process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || '';
export const emailConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS && ownerInbox());

let transport;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      // fail fast instead of hanging the order request if Gmail is slow to answer
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      auth: { user: process.env.SMTP_USER, pass: String(process.env.SMTP_PASS || '').replace(/\s+/g, '') }
    });
  }
  return transport;
}

/**
 * attachments: [{ filename, content: Buffer | base64 string, contentType?, cid? }]
 * Returns { sent: true } or { sent: false, skipped | error }.
 */
export async function sendEmail({ to, subject, html, replyTo, attachments = [], fromName = 'NeeksxArt Website' }) {
  const inbox = to || ownerInbox();
  if (!emailConfigured() || !inbox) return { sent: false, skipped: true };
  try {
    await getTransport().sendMail({
      from: { name: fromName, address: process.env.SMTP_USER }, // Gmail only sends as the signed-in account
      to: inbox.split(',').map(s => s.trim()).filter(Boolean),
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
      attachments: attachments.map(a => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(String(a.content || ''), 'base64'),
        ...(a.contentType ? { contentType: a.contentType } : {}),
        ...(a.cid ? { cid: a.cid } : {})
      }))
    });
    return { sent: true };
  } catch (e) {
    console.error('SMTP error', e?.code || '', e?.response || e?.message);
    return { sent: false, error: true };
  }
}

export const table = rows =>
  `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#666;font-weight:bold;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('')}</table>`;

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://neeksxart.com').replace(/\/$/, '');

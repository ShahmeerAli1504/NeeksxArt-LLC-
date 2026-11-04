// Vercel serverless function: emails contact-form submissions via Resend.
// Required environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY    – API key from https://resend.com
//   CONTACT_TO_EMAIL  – inbox that receives inquiries (NeeksxArt's email)
// Optional:
//   CONTACT_FROM_EMAIL – verified sender, e.g. "NeeksxArt Website <hello@neeksxart.com>"
//                        (defaults to Resend's onboarding sender)

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function dataUrlToAttachment(dataUrl, filename) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  return { filename, content: m[2] };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return res.status(500).json({ ok: false, error: 'Email is not configured yet' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (b.company_site) return res.status(200).json({ ok: true }); // honeypot

  const name = (b.name || '').trim(), email = (b.email || '').trim(), message = (b.message || '').trim();
  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Missing name, email or message' });
  }

  const rows = [
    ['Topic', b.topic], ['Name', name], ['Business / event', b.business], ['Email', email], ['Phone', b.phone],
    ['Product', b.product], ['Quantity', b.quantity], ['Need by', b.deadline], ['Ship to', b.shipTo]
  ].filter(([, v]) => v);

  const studioRows = Array.isArray(b.studio) ? b.studio : [];
  const table = r => `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${r.map(([k, v]) =>
    `<tr><td style="color:#666;font-weight:bold;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>`;

  const attachments = [];
  const mock = dataUrlToAttachment(b.mockup, 'merch-studio-mockup.jpg');
  if (mock) attachments.push(mock);
  if (b.logo && b.logo.data) {
    const safe = String(b.logo.name || 'logo').replace(/[^\w.\-]+/g, '_').slice(0, 80);
    const lg = dataUrlToAttachment(b.logo.data, safe);
    if (lg) attachments.push(lg);
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px">
      <h2 style="margin:0 0 8px">New inquiry from the NeeksxArt website</h2>
      <p style="color:#666;margin:0 0 18px">${esc(b.topic || 'General question')}</p>
      ${table(rows)}
      <h3 style="margin:22px 0 8px">Message</h3>
      <p style="white-space:pre-wrap;font-size:15px">${esc(message)}</p>
      ${studioRows.length ? `<h3 style="margin:22px 0 8px">Merch Studio design</h3>${table(studioRows)}<p style="color:#666">Mockup image attached.</p>` : ''}
      ${b.logo ? '<p style="color:#666">Customer logo attached.</p>' : ''}
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'NeeksxArt Website <onboarding@resend.dev>',
        to: to.split(',').map(s => s.trim()),
        reply_to: email,
        subject: `${b.topic || 'Website inquiry'}: ${name}${b.business ? ' (' + b.business + ')' : ''}`,
        html,
        attachments
      })
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('Resend error', r.status, t);
      return res.status(502).json({ ok: false, error: 'Email provider error' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };

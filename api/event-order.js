// Vercel serverless function: live pop-up orders → email to NeeksxArt with every photo attached.
// Uses the same env vars as /api/contact:
//   RESEND_API_KEY, CONTACT_TO_EMAIL (or EVENT_TO_EMAIL to send pop-up orders somewhere else),
//   CONTACT_FROM_EMAIL (optional)
// If email isn't configured yet, the order is accepted in DEMO mode (nothing is sent) so the
// flow can be shown to clients. Set EVENT_REQUIRE_EMAIL=1 to turn demo mode off.

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const b64 = d => { const m = /^data:image\/(jpeg|png);base64,(.+)$/.exec(d || ''); return m ? m[2] : null; };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  const orderId = String(b.orderId || '').slice(0, 20);
  const name = String(b.name || '').trim().slice(0, 60);
  const photos = Array.isArray(b.photos) ? b.photos.slice(0, 12) : [];
  if (!orderId || !name || !photos.length || photos.some(p => !b64(p))) {
    return res.status(400).json({ ok: false, error: 'Missing order details or photos' });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.EVENT_TO_EMAIL || process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    if (process.env.EVENT_REQUIRE_EMAIL === '1') return res.status(500).json({ ok: false, error: 'Email is not configured' });
    return res.status(200).json({ ok: true, demo: true });
  }

  const items = Array.isArray(b.items) ? b.items : [];
  const rows = [
    ['Order #', orderId], ['Event', b.event], ['Pack', b.bundle], ['Name', name],
    ['Phone', b.phone], ['Email', b.email], ['Notes', b.note],
    ['Pieces', items.map((k, i) => `#${i + 1} ${k}`).join(', ')],
    ['Shape', b.shape], ['Received', new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })]
  ].filter(([, v]) => v);

  const attachments = [];
  const sheet = b64(b.sheet);
  if (sheet) attachments.push({ filename: `${orderId}-overview.jpg`, content: sheet });
  photos.forEach((p, i) => attachments.push({ filename: `${orderId}-${String(i + 1).padStart(2, '0')}-${items[i] || 'photo'}.jpg`, content: b64(p) }));

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px">
      <div style="background:#ee6a2c;color:#fff;padding:18px 22px;border-radius:12px">
        <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase">New pop-up order</div>
        <div style="font-size:40px;font-weight:bold;margin-top:4px">${esc(orderId)}</div>
        <div style="font-size:16px">${esc(name)} · ${esc(b.bundle || '')}</div>
      </div>
      <table cellpadding="6" style="border-collapse:collapse;font-size:14px;margin-top:14px">
        ${rows.map(([k, v]) => `<tr><td style="color:#666;font-weight:bold">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
      </table>
      <p style="color:#666">Print files attached: ${photos.length} cropped photos (900×900 JPG, numbered in pack order) + an overview sheet.</p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'NeeksxArt Live <onboarding@resend.dev>',
        to: to.split(',').map(s => s.trim()),
        ...(b.email ? { reply_to: b.email } : {}),
        subject: `🔥 POP-UP ${orderId} · ${b.bundle || 'Order'} · ${name}${b.event ? ' · ' + b.event : ''}`,
        html, attachments
      })
    });
    if (!r.ok) { console.error('Resend error', r.status, await r.text()); return res.status(502).json({ ok: false, error: 'Email provider error' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };

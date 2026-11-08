/*
 * Branded HTML emails for the owner (table layout + inline styles so they look right in
 * Gmail, Apple Mail and Outlook). Plain module: used by the API routes and `npm run email:test`.
 */

export const esc = (s = '') =>
  String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ORANGE = '#E1AD01', INK = '#0b0b0b', PAPER = '#ffffff', SOFT = '#5f5f5f'; // brand: mustard, black, white
const FONT = "font-family:Helvetica,Arial,sans-serif";

const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const button = (href, label, bg = ORANGE, color = INK) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;font-weight:bold;font-size:14px;padding:10px 18px;border:2px solid ${bg === '#ffffff' ? INK : bg};border-radius:999px;margin:4px 6px 4px 0;${FONT}">${label}</a>`;

const rowsHtml = rows => rows.filter(([, v]) => v).map(([k, v, raw]) => `
  <tr>
    <td style="padding:9px 14px 9px 0;color:${SOFT};font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;vertical-align:top;white-space:nowrap;${FONT}">${esc(k)}</td>
    <td style="padding:9px 0;color:${INK};font-size:15px;vertical-align:top;${FONT}">${raw ? v : esc(v)}</td>
  </tr>`).join('');

function shell({ preheader, header, body }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAPER}">
  <span style="display:none!important;opacity:0;color:transparent;max-height:0;overflow:hidden">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden">
        <tr><td style="background:${INK};padding:16px 24px;color:${PAPER};font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;${FONT}">NeeksxArt</td></tr>
        ${header}
        <tr><td style="padding:22px 24px 8px">${body}</td></tr>
        <tr><td style="padding:18px 24px 24px;color:${SOFT};font-size:12px;${FONT}">Sent automatically by the NeeksxArt website. Reply to this email to answer the customer directly.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Pop-up order email.
 * d: { orderId, event, bundle, price, name, phone, email, note, items[], shape, receivedAt }
 * photoCount: number of attached photos (each has cid photo1..photoN), hasSheet: overview cid "overview"
 */
export function orderEmail(d, { photoCount, hasSheet, boardUrl } = {}) {
  const pieces = (d.items || []).map((k, i) => `#${i + 1} ${k}`).join(', ');
  const header = `
    <tr><td style="background:${ORANGE};padding:26px 24px;color:${INK};${FONT}">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;opacity:.9">New pop-up order${d.event ? ' · ' + esc(d.event) : ''}</div>
      <div style="font-size:46px;line-height:1.05;font-weight:bold;margin-top:6px;letter-spacing:1px">${esc(d.orderId)}</div>
      <div style="font-size:17px;margin-top:6px">${esc(d.name)} · ${esc(d.bundle)}${d.price ? ' · ' + esc(d.price) : ''}</div>
    </td></tr>`;

  // photos shown inside the email, 3 per row, numbered like the print files
  let grid = '';
  if (photoCount) {
    const cells = Array.from({ length: photoCount }, (_, i) => `
      <td width="33%" style="padding:4px;vertical-align:top">
        <img src="cid:photo${i + 1}" alt="Photo ${i + 1}" width="184" style="display:block;width:100%;max-width:184px;height:auto;border-radius:10px;border:0">
        <div style="font-size:12px;color:${SOFT};padding-top:4px;${FONT}">#${i + 1} ${esc((d.items || [])[i] || 'photo')}</div>
      </td>`);
    const rows = [];
    for (let i = 0; i < cells.length; i += 3) rows.push(`<tr>${cells.slice(i, i + 3).join('')}${'<td width="33%"></td>'.repeat(Math.max(0, 3 - cells.slice(i, i + 3).length))}</tr>`);
    grid = `<h3 style="margin:22px 0 8px;font-size:16px;color:${INK};${FONT}">Photos to print (${photoCount})</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>`;
  }

  const actions = [
    d.phone && button(telHref(d.phone), `Call ${esc(d.name.split(' ')[0])}`),
    d.phone && button('sms:' + String(d.phone).replace(/[^\d+]/g, ''), 'Text when ready', INK),
    d.email && button(`mailto:${d.email}?subject=${encodeURIComponent('Your NeeksxArt order ' + d.orderId)}`, 'Email guest', '#ffffff', INK),
    boardUrl && button(boardUrl, 'Open order board', INK)
  ].filter(Boolean).join('');

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rowsHtml([
        ['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Notes', d.note],
        ['Pack', d.bundle], ['Pieces', pieces], ['Shape', d.shape], ['Price', d.price ? `${d.price} (pay at the booth)` : ''],
        ['Event', d.event], ['Received', d.receivedAt]
      ])}
    </table>
    ${actions ? `<div style="margin:16px 0 4px">${actions}</div>` : ''}
    ${grid}
    ${hasSheet ? `<h3 style="margin:22px 0 8px;font-size:16px;color:${INK};${FONT}">Overview sheet</h3>
      <img src="cid:overview" alt="Order overview" width="592" style="display:block;width:100%;max-width:592px;height:auto;border-radius:12px;border:0">` : ''}
    <p style="margin:18px 0 0;color:${SOFT};font-size:13px;${FONT}">
      <b style="color:${INK}">Print files attached:</b> ${photoCount} full-size photo${photoCount === 1 ? '' : 's'} (900×900 JPG, cropped by the guest, numbered in pack order)${hasSheet ? ' + the overview sheet' : ''}.
    </p>`;

  return {
    subject: `🔥 POP-UP ${d.orderId} · ${d.bundle || 'Order'} · ${d.name}${d.event ? ' · ' + d.event : ''}`,
    html: shell({ preheader: `${d.name} ordered ${d.bundle} (${photoCount} photos)`, header, body })
  };
}

/**
 * Website inquiry email (contact form, bulk orders, event quotes, Merch Studio).
 * d: { topic, name, business, email, phone, product, quantity, deadline, shipTo, message, studio[][], receivedAt }
 */
export function inquiryEmail(d, { hasMockup, hasLogo, logoName, dashboardUrl } = {}) {
  const header = `
    <tr><td style="background:${ORANGE};padding:24px;color:${INK};${FONT}">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;opacity:.9">New website inquiry</div>
      <div style="font-size:28px;line-height:1.15;font-weight:bold;margin-top:6px">${esc(d.topic || 'General question')}</div>
      <div style="font-size:16px;margin-top:4px">${esc(d.name)}${d.business ? ' · ' + esc(d.business) : ''}</div>
    </td></tr>`;
  const actions = [
    button(`mailto:${d.email}?subject=${encodeURIComponent('Re: your NeeksxArt inquiry')}`, 'Reply'),
    d.phone && button(telHref(d.phone), 'Call', INK),
    dashboardUrl && button(dashboardUrl, 'Open dashboard', '#ffffff', INK)
  ].filter(Boolean).join('');
  const studio = Array.isArray(d.studio) && d.studio.length
    ? `<h3 style="margin:22px 0 8px;font-size:16px;color:${INK};${FONT}">Merch Studio design</h3>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml(d.studio)}</table>` : '';
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rowsHtml([
        ['Name', d.name], ['Business / event', d.business], ['Email', d.email], ['Phone', d.phone],
        ['Product', d.product], ['Quantity', d.quantity], ['Need by', d.deadline], ['Ship to', d.shipTo], ['Received', d.receivedAt]
      ])}
    </table>
    <h3 style="margin:20px 0 8px;font-size:16px;color:${INK};${FONT}">Message</h3>
    <div style="background:${PAPER};border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.5;color:${INK};white-space:pre-wrap;${FONT}">${esc(d.message)}</div>
    <div style="margin:16px 0 4px">${actions}</div>
    ${studio}
    ${hasMockup ? `<h3 style="margin:22px 0 8px;font-size:16px;color:${INK};${FONT}">Their mockup</h3>
      <img src="cid:mockup" alt="Merch Studio mockup" width="400" style="display:block;width:100%;max-width:400px;height:auto;border-radius:12px;border:0">` : ''}
    ${hasLogo ? `<p style="margin:16px 0 0;color:${SOFT};font-size:13px;${FONT}"><b style="color:${INK}">Attached:</b> customer's original artwork (${esc(logoName || 'logo')})${hasMockup ? ' + the mockup' : ''}.</p>` : (hasMockup ? `<p style="margin:16px 0 0;color:${SOFT};font-size:13px;${FONT}"><b style="color:${INK}">Attached:</b> the mockup image.</p>` : '')}`;
  return {
    subject: `${d.topic || 'Website inquiry'}: ${d.name}${d.business ? ' (' + d.business + ')' : ''}`,
    html: shell({ preheader: String(d.message || '').slice(0, 120), header, body })
  };
}

export const receivedAt = () =>
  new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' (Reno time)';

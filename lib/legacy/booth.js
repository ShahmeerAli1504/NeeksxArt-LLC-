/* NeeksxArt Live booth poster (staff tool at /booth): event name → guest QR → print / download */
import NXQR, { qrSvg } from '@/lib/legacy/qr';
import { slugify as slug } from '@/lib/bundles';

export function init() {
  const $ = s => document.querySelector(s);
  const ev = $('#boothEvent');
  if (!ev || ev.dataset.nxInit) return;
  ev.dataset.nxInit = '1';

  const guestUrl = name => `${location.origin}/event?e=${encodeURIComponent(slug(name))}`;
  const headIn = $('#boothHeadline');
  let copyTimer;

  const render = () => {
    const url = guestUrl(ev.value || 'Pop-Up');
    $('#boothLink').textContent = url;
    $('#openGuest').href = url + '&new=1';
    $('#posterQr').innerHTML = qrSvg(url);
    $('#posterEvent').textContent = ev.value || 'Pop-Up';
    $('#posterHead').textContent = headIn.value || 'Your photos, pressed while you wait';
    try { localStorage.setItem('nxBooth', JSON.stringify({ e: ev.value, h: headIn.value })); } catch (e) { /* storage blocked */ }
  };

  try {
    const s = JSON.parse(localStorage.getItem('nxBooth') || 'null');
    if (s) { ev.value = s.e || ev.value; headIn.value = s.h || headIn.value; }
  } catch (e) { /* storage blocked */ }
  const fromUrl = new URLSearchParams(location.search).get('e');
  if (fromUrl) ev.value = fromUrl;

  ev.addEventListener('input', render);
  headIn.addEventListener('input', render);
  $('#printBtn').addEventListener('click', () => window.print());
  $('#copyLink').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#boothLink').textContent); $('#copyLink').textContent = 'Copied!'; }
    catch (e) { $('#copyLink').textContent = 'Select & copy'; }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { const b = $('#copyLink'); if (b) b.textContent = 'Copy'; }, 1600);
  });
  $('#dlQr').addEventListener('click', () => {
    const q = NXQR(guestUrl(ev.value || 'Pop-Up'), 'M'), n = q.getModuleCount(), m = 4, px = 24;
    const c = document.createElement('canvas'); c.width = c.height = (n + m * 2) * px;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#0b0b0b';
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + m) * px, (r + m) * px, px, px);
    const a = document.createElement('a'); a.download = `neeksxart-qr-${slug(ev.value)}.png`; a.href = c.toDataURL('image/png'); a.click();
  });
  render();

  return () => clearTimeout(copyTimer);
}

/* NeeksxArt contact form: pulls in Merch Studio mockups and sends via /api/contact */
import { PRODUCTS, requestMessage, finishesFor } from '../catalog.js';

const qtyBucket = q => q < 25 ? 'Under 25' : q < 50 ? '25 – 49' : q < 100 ? '50 – 99' : q < 250 ? '100 – 249' : q < 500 ? '250 – 499' : q < 1000 ? '500 – 999' : '1,000+';

export function init() {
  const $ = s => document.querySelector(s);
  const form = $('#contactForm');
  if (!form || form.dataset.nxInit) return;
  form.dataset.nxInit = '1';
  const status = $('#formStatus');
  let mock = null, logo = null;

  // ---- preselect topic from the URL (e.g. /contact?topic=event) ----
  const urlTopic = { event: 'Event or wedding', help: 'Creative assistance', nfc: 'Tap-to-Connect NFC' }[new URLSearchParams(location.search).get('topic')];
  if (urlTopic) { const t = document.querySelector(`input[name=topic][value="${urlTopic}"]`); if (t) t.checked = true; }

  // ---- mirror keychains: Sandy Mylar or glossy (only shown for mirror products) ----
  const pickFinish = f => { const r = f && document.querySelector(`input[name=finish][value="${f}"]`); if (r) r.checked = true; };
  const finishOn = () => !!finishesFor({ studio: $('#product').value });
  // a class (not the hidden attribute: .field's display rule beats it)
  const syncFinish = () => { $('#finishField').classList.toggle('on', finishOn()); };
  $('#product').addEventListener('change', syncFinish);

  // ---- "Request to order" from a catalog product: /contact?item=mirror225&qty=10&finish=Glossy#contactForm ----
  const sp = new URLSearchParams(location.search);
  const asked = PRODUCTS.find(p => p.id === sp.get('item'));
  if (asked) {
    const q = parseInt(sp.get('qty'), 10) || 0;
    const fin = finishesFor(asked)?.includes(sp.get('finish')) ? sp.get('finish') : '';
    pickFinish(fin);
    // the product dropdown uses the same keys as the Merch Studio
    if ([...$('#product').options].some(o => o.value === asked.studio)) $('#product').value = asked.studio;
    if (q) $('#quantity').value = qtyBucket(q);
    const topic = asked.special ? 'Special order' : /^nfc/.test(asked.studio) ? 'Tap-to-Connect NFC' : 'Bulk / large order';
    const tp = document.querySelector(`input[name=topic][value="${topic}"]`); if (tp) tp.checked = true;
    if (!$('#message').value) $('#message').value = requestMessage(asked, q, fin);
  }
  if (location.hash === '#contactForm') setTimeout(() => $('#name')?.focus({ preventScroll: true }), 300);

  // ---- attach a design coming from the Merch Studio ----
  try { mock = JSON.parse(sessionStorage.getItem('neeksMockup') || 'null'); } catch (e) { mock = null; }
  if (mock && mock.mockup) {
    $('#mockAttached').classList.add('show');
    $('#mockImg').src = mock.mockup;
    $('#mockSummary').textContent = mock.summary.map(([k, v]) => `${k}: ${v}`).join(' · ');
    if (mock.product) $('#product').value = mock.product;
    const q = mock.qty;
    if (q) {
      const opts = [...$('#quantity').options].map(o => o.value);
      const pick = qtyBucket(q);
      if (opts.includes(pick)) $('#quantity').value = pick;
    }
    if (mock.needBy) $('#deadline').value = mock.needBy;
    const studioFinish = (mock.summary.find(([k]) => k === 'Finish') || [])[1] || '';
    pickFinish(/gloss/i.test(studioFinish) ? 'Glossy' : /mylar/i.test(studioFinish) ? 'Sandy Mylar' : '');
    const topic = mock.intent === 'help' ? 'Creative assistance' : mock.intent === 'order' ? 'Special order' : /^nfc/.test(mock.product) ? 'Tap-to-Connect NFC' : null;
    const tp = topic && document.querySelector(`input[name=topic][value="${topic}"]`); if (tp) tp.checked = true;
    if (mock.intent === 'help') $('#mockAttached strong').textContent = 'Your Merch Studio design is attached (creative assistance request)';
    $('#message').placeholder = "Anything else we should know? Event date, colors, packaging, shipping questions…";
    if (mock.logo) logo = { name: mock.fileName || 'logo.png', data: mock.logo };
    if (logo) $('#fileText').textContent = `📎 ${logo.name} (from the Merch Studio)`;
  }
  syncFinish();
  $('#mockRemove').addEventListener('click', () => {
    mock = null; sessionStorage.removeItem('neeksMockup'); $('#mockAttached').classList.remove('show');
  });

  // ---- optional logo upload ----
  $('#logoFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 2.5 * 1024 * 1024) { $('#fileText').textContent = '⚠️ That file is over 2.5 MB. Please attach a smaller version or DM it to us.'; return; }
    const fr = new FileReader();
    fr.onload = () => { logo = { name: f.name, data: fr.result }; $('#fileText').textContent = `📎 ${f.name}`; };
    fr.readAsDataURL(f);
  });

  function show(msg, ok) { status.className = 'form-status ' + (ok ? 'ok' : 'err'); status.innerHTML = msg; }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (data.company_site) return; // bot
    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) { show('Please add your name, email and a message.', false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { show('That email address doesn\'t look right.', false); return; }

    // the mirror finish rides along with the product so it shows in the email and dashboard
    const { finish, ...rest } = data;
    if (finishOn() && finish) rest.product = `${rest.product} · ${finish} finish`;
    const payload = {
      ...rest,
      studio: mock ? mock.summary : null,
      mockup: mock ? mock.mockup : null,
      logo: logo
    };
    const btn = $('#sendBtn'); btn.disabled = true; btn.style.opacity = .7;
    const label = btn.innerHTML; btn.textContent = 'Sending…';
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'Send failed');
      show('🎉 Message sent! Neeks will get back to you soon. Keep an eye on your inbox.', true);
      form.reset(); syncFinish(); sessionStorage.removeItem('neeksMockup'); $('#mockAttached').classList.remove('show'); mock = null; logo = null;
      $('#fileText').textContent = '📎 Tap to attach a logo or artwork (max 2.5 MB)';
    } catch (err) {
      show('We couldn\'t send that right now. Please email <a href="mailto:info@neeksxart.com" style="text-decoration:underline">info@neeksxart.com</a> or DM us on <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" style="text-decoration:underline">Instagram</a> or <a href="https://www.facebook.com/NEEKSxART/" target="_blank" rel="noopener" style="text-decoration:underline">Facebook</a> and we\'ll take care of you.', false);
    } finally { btn.disabled = false; btn.style.opacity = 1; btn.innerHTML = label; }
  });
}

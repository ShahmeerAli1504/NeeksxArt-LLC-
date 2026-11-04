/* NeeksxArt contact form: pulls in Merch Studio mockups and sends via /api/contact */
(function () {
  const $ = s => document.querySelector(s);
  const form = $('#contactForm');
  const status = $('#formStatus');
  let mock = null, logo = null;

  // ---- preselect topic from the URL (e.g. /contact?topic=event) ----
  if (new URLSearchParams(location.search).get('topic') === 'event') {
    const t = document.querySelector('input[name=topic][value="Event or wedding"]'); if (t) t.checked = true;
  }

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
      const pick = q < 25 ? 'Under 25' : q < 50 ? '25 – 49' : q < 100 ? '50 – 99' : q < 250 ? '100 – 249' : q < 500 ? '250 – 499' : q < 1000 ? '500 – 999' : '1,000+';
      if (opts.includes(pick)) $('#quantity').value = pick;
    }
    if (mock.needBy) $('#deadline').value = mock.needBy;
    if (mock.product === 'nfc') document.querySelector('input[name=topic][value="Tap-to-Connect NFC"]').checked = true;
    $('#message').placeholder = "Anything else we should know? Event date, colors, packaging, shipping questions…";
    if (mock.logo) logo = { name: mock.fileName || 'logo.png', data: mock.logo };
    if (logo) $('#fileText').textContent = `📎 ${logo.name} (from the Merch Studio)`;
  }
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

    const payload = {
      ...data,
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
      form.reset(); sessionStorage.removeItem('neeksMockup'); $('#mockAttached').classList.remove('show'); mock = null; logo = null;
      $('#fileText').textContent = '📎 Tap to attach a logo or artwork (max 2.5 MB)';
    } catch (err) {
      show('We couldn\'t send that right now. Please email <a href="mailto:info@neeksxart.com" style="text-decoration:underline">info@neeksxart.com</a> or DM us on <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" style="text-decoration:underline">Instagram</a> or <a href="https://www.facebook.com/NEEKSxART/" target="_blank" rel="noopener" style="text-decoration:underline">Facebook</a> and we\'ll take care of you.', false);
    } finally { btn.disabled = false; btn.style.opacity = 1; btn.innerHTML = label; }
  });
})();

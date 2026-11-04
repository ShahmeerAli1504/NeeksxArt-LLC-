/* NeeksxArt event quote form → /api/contact (falls back to email) */
(function () {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  const status = document.getElementById('qStatus');
  const show = (m, ok) => { status.className = 'form-status ' + (ok ? 'ok' : 'err'); status.innerHTML = m; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('company_site')) return;
    const name = (fd.get('name') || '').trim(), email = (fd.get('email') || '').trim(), msg = (fd.get('message') || '').trim();
    if (!name || !email || !msg) return show('Please add your name, email and a few details about your event.', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('That email address doesn\'t look right.', false);

    const prefs = fd.getAll('prefs').join(', ');
    const budget = (fd.get('budget') || '').trim();
    const message = [msg, prefs && `Product preferences: ${prefs}`, budget && `Budget: ${budget}`].filter(Boolean).join('\n\n');
    const payload = {
      topic: 'Event quote request', name, email, business: fd.get('business'),
      deadline: fd.get('deadline'), quantity: fd.get('quantity'), product: prefs, message
    };
    const btn = document.getElementById('qBtn'); const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'failed');
      show('🎉 Quote request sent! We\'ll be in touch soon with ideas and a free mockup.', true);
      form.reset();
    } catch (err) {
      const body = encodeURIComponent(`Name: ${name}\nEvent date: ${payload.deadline || ''}\nEvent type & theme: ${payload.business || ''}\nQuantity: ${payload.quantity || ''}\n\n${message}`);
      show(`We couldn't send that from here. <a href="mailto:info@neeksxart.com?subject=Event%20quote%20request&body=${body}" style="text-decoration:underline">Tap to email it to info@neeksxart.com</a> instead.`, false);
    } finally { btn.disabled = false; btn.innerHTML = label; }
  });
})();

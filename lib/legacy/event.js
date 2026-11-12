/* =========================================================
   NeeksxArt live pop-up ordering
   QR code → pick a bundle → upload photos → ticket with order #
   Photos are saved to Supabase Storage by /api/event-order and the
   ticket polls the order status the staff set in /admin.
   ========================================================= */
import { BUNDLES, POPUP as CFG, STATUS_LABEL, cleanTapUrl } from '@/lib/bundles';
import { withTax } from '@/lib/popup-tax';

export function init() {
  const $ = s => document.querySelector(s);
  if (!$('#orderView') || $('#orderView').dataset.nxInit) return;
  $('#orderView').dataset.nxInit = '1';
  let pollTimer = null;
  const KIND = { magnet: 'Magnet', keychain: 'Keychain', keychain15: '1.5" Keychain', mirror: 'Mirror', button: 'Button' };
  // the live pop-up (started from the dashboard) decides which event orders belong to
  const shell = document.querySelector('.ev-shell');
  const params = new URLSearchParams(location.search);
  const eventSlug = (shell?.dataset.eventSlug || params.get('e') || 'pop-up').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'pop-up';
  const eventName = shell?.dataset.eventName || eventSlug.split('-').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  $('#eventName').textContent = `NeeksxArt Live · ${eventName}`;
  document.title = `${eventName} | NeeksxArt Live Pop-Up`;
  // sales tax for this pop-up's location (picked in the dashboard when Live ordering is switched on)
  const taxRate = Number(shell?.dataset.taxRate) || 0;
  const priced = b => withTax(b.price, taxRate);
  $('#readyRange').textContent = `${CFG.readyMinutes[0]}–${CFG.readyMinutes[1]} min`;

  let bundle = BUNDLES.find(b => b.id === params.get('pack')) || BUNDLES[0];
  let slots = [];                       // {img: canvas, zoom, ox, oy} | null
  let spare = [];                       // photos kept aside when switching to a smaller pack
  let editing = -1;

  /* ---------- bundles ---------- */
  function bundleIcon(b) {
    const n = b.items.length, cols = b.cols;
    const cells = b.items.map(k => `<i class="${b.shape === 'round' || k !== 'magnet' ? 'round' : ''}"></i>`).join('');
    return `<span class="bundle-ico" style="grid-template-columns:repeat(${cols},1fr)">${cells}</span>`;
  }
  function renderBundles() {
    $('#bundleList').innerHTML = BUNDLES.map(b => `
      <button type="button" class="bundle" role="radio" aria-checked="${b.id === bundle.id}" data-id="${b.id}">
        ${b.tag ? `<span class="btag">${b.tag}</span>` : ''}
        ${bundleIcon(b)}
        <span><span class="count">${b.items.length} piece${b.items.length === 1 ? '' : 's'}${b.price ? ' · ' + b.price + (taxRate ? ' + tax' : '') : ''}</span><h3>${b.name}</h3><p>${b.blurb}</p></span>
      </button>`).join('');
  }
  $('#bundleList').addEventListener('click', e => {
    const b = e.target.closest('.bundle'); if (!b) return;
    const next = BUNDLES.find(x => x.id === b.dataset.id);
    if (next.id === bundle.id) return;
    const kept = [...slots.filter(Boolean), ...spare];
    bundle = next;
    slots = Array(bundle.items.length).fill(null).map((_, i) => kept[i] || null);
    spare = kept.slice(bundle.items.length);
    renderBundles(); renderSlots(); update();
  });

  /* ---------- image utils ---------- */
  function fileToCanvas(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const max = 1600, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c);
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
      im.src = url;
    });
  }
  // draw a slot's crop into ctx as a size×size square
  function drawCrop(ctx, s, size) {
    const iw = s.img.width, ih = s.img.height;
    const k = size / Math.min(iw, ih) * s.zoom;
    const w = iw * k, h = ih * k;
    clampOffsets(s, w, h, size);
    ctx.drawImage(s.img, (size - w) / 2 + s.ox * size, (size - h) / 2 + s.oy * size, w, h);
  }
  function clampOffsets(s, w, h, size) {
    const mx = Math.max(0, (w - size) / 2 / size), my = Math.max(0, (h - size) / 2 / size);
    s.ox = Math.max(-mx, Math.min(mx, s.ox)); s.oy = Math.max(-my, Math.min(my, s.oy));
  }

  /* ---------- slots ---------- */
  function renderSlots() {
    const box = $('#slots');
    box.style.gridTemplateColumns = `repeat(${bundle.cols},1fr)`;
    box.innerHTML = bundle.items.map((k, i) => {
      const round = bundle.shape === 'round' || k !== 'magnet';
      return `<button type="button" class="slot ${round ? 'round' : ''} ${k}" data-i="${i}" aria-label="${KIND[k]} ${i + 1}">
        +<small>${KIND[k]} ${i + 1}</small></button>`;
    }).join('');
    slots.forEach((s, i) => s && paintSlot(i));
  }
  function paintSlot(i) {
    const el = $(`.slot[data-i="${i}"]`); if (!el) return;
    const s = slots[i];
    if (!s) { el.className = el.className.replace(' filled', ''); el.innerHTML = `+<small>${KIND[bundle.items[i]]} ${i + 1}</small>`; return; }
    el.classList.add('filled');
    el.innerHTML = `<canvas width="360" height="360"></canvas>${bundle.items[i] !== 'magnet' || bundle.items.some(x => x !== 'magnet') ? `<span class="kind">${KIND[bundle.items[i]]}</span>` : ''}`;
    drawCrop(el.querySelector('canvas').getContext('2d'), s, 360);
  }
  $('#slots').addEventListener('click', e => {
    const el = e.target.closest('.slot'); if (!el) return;
    const i = +el.dataset.i;
    if (slots[i]) openEditor(i);
    else { pendingSlot = i; singleInput.click(); }
  });
  const singleInput = document.createElement('input');
  singleInput.type = 'file'; singleInput.accept = 'image/*';
  let pendingSlot = -1;
  singleInput.addEventListener('change', async () => {
    const f = singleInput.files[0]; singleInput.value = '';
    if (f && pendingSlot > -1) await placeFiles([f], pendingSlot);
  });
  $('#multiInput').addEventListener('change', async e => {
    const files = [...e.target.files]; e.target.value = '';
    await placeFiles(files, -1);
  });
  async function placeFiles(files, at) {
    for (const f of files) {
      if (!/^image\//.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) continue;
      let idx = at > -1 ? at : slots.findIndex(s => !s);
      if (idx < 0) break;
      // big camera photos can take a few seconds to open on a phone: show that the spot is working on it
      const el = $(`.slot[data-i="${idx}"]`);
      if (el && !slots[idx]) { el.classList.add('loading'); el.innerHTML = `<small>Loading photo…</small>`; }
      try {
        const c = await fileToCanvas(f);
        slots[idx] = { img: c, zoom: 1, ox: 0, oy: 0 };
      } catch (err) { alert(`Couldn't open ${f.name}. Try a JPG or PNG screenshot of it.`); }
      el?.classList.remove('loading');
      paintSlot(idx);
      at = -1;
    }
    update();
  }
  $('#repeatBtn').addEventListener('click', () => {
    const have = slots.filter(Boolean); if (!have.length) return;
    let j = 0;
    slots = slots.map(s => s || { ...have[j++ % have.length] });
    renderSlots(); update();
  });

  /* ---------- editor ---------- */
  const ed = $('#editor'), ec = $('#editCanvas'), ex = ec.getContext('2d');
  function openEditor(i) {
    editing = i; ed.hidden = false;
    $('#editorTitle').textContent = `${KIND[bundle.items[i]]} ${i + 1}`;
    $('#editZoom').value = Math.round(slots[i].zoom * 100);
    drawEditor();
  }
  function drawEditor() {
    const s = slots[editing]; if (!s) return;
    const S = ec.width;
    ex.fillStyle = '#000'; ex.fillRect(0, 0, S, S);
    drawCrop(ex, s, S);
    const round = bundle.shape === 'round' || bundle.items[editing] !== 'magnet';
    ex.save(); ex.fillStyle = 'rgba(0,0,0,.55)';
    ex.beginPath(); ex.rect(0, 0, S, S);
    if (round) ex.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2, true);
    else ex.rect(S - 6, 6, -(S - 12), S - 12);
    ex.fill('evenodd'); ex.restore();
    ex.strokeStyle = '#fff'; ex.lineWidth = 3; ex.beginPath();
    round ? ex.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2) : ex.rect(6, 6, S - 12, S - 12); ex.stroke();
  }
  $('#editZoom').addEventListener('input', e => { slots[editing].zoom = e.target.value / 100; drawEditor(); });
  let drag = null;
  ec.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ox: slots[editing].ox, oy: slots[editing].oy }; ec.setPointerCapture(e.pointerId); });
  ec.addEventListener('pointermove', e => {
    if (!drag) return; const r = ec.getBoundingClientRect();
    slots[editing].ox = drag.ox + (e.clientX - drag.x) / r.width; slots[editing].oy = drag.oy + (e.clientY - drag.y) / r.height; drawEditor();
  });
  ['pointerup', 'pointercancel'].forEach(t => ec.addEventListener(t, () => drag = null));
  function closeEditor() { ed.hidden = true; paintSlot(editing); editing = -1; update(); }
  $('#doneBtn').addEventListener('click', closeEditor);
  ed.addEventListener('click', e => { if (e.target === ed) closeEditor(); });
  $('#removeBtn').addEventListener('click', () => { slots[editing] = null; closeEditor(); });
  $('#replaceInput').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try { slots[editing] = { img: await fileToCanvas(f), zoom: 1, ox: 0, oy: 0 }; $('#editZoom').value = 100; drawEditor(); }
    catch (err) { alert('Couldn\'t open that photo.'); }
  });

  /* ---------- state ---------- */
  function update() {
    const n = slots.filter(Boolean).length, total = bundle.items.length;
    $('#progText').textContent = `${n} of ${total} added`;
    $('#progBar').style.width = `${n / total * 100}%`;
    $('#addLabel').textContent = n ? (n < total ? `Add more photos (${total - n} left)` : 'All set! Tap a photo to adjust') : `Add ${total} photos`;
    $('#repeatBtn').hidden = !(n > 0 && n < total);
    $('#barBundle').textContent = bundle.name;
    const pr = priced(bundle);
    $('#barPrice').textContent = pr ? `${pr.line} · pay at the booth` : 'Pay at the booth';
    const nameOk = $('#evName').value.trim().length > 0;
    // Tap-to-Connect packs need the link we program into the chips
    $('#tapField').hidden = !bundle.tap;
    const tapRaw = $('#evTap').value.trim();
    const tapOk = !bundle.tap || !!cleanTapUrl(tapRaw);
    $('#evTap').setAttribute('aria-invalid', String(!!bundle.tap && !!tapRaw && !tapOk));
    $('#submitBtn').disabled = !(n === total && nameOk && tapOk);
    $('#submitBtn').textContent = n < total ? `Add ${total - n} more photo${total - n > 1 ? 's' : ''}` : !nameOk ? 'Add your name'
      : !tapOk ? (tapRaw ? 'Check your tap link' : 'Add your tap link') : 'Send to the press';
  }
  $('#evName').addEventListener('input', update);
  $('#evTap').addEventListener('input', update);

  /* ---------- submit ---------- */
  function exportSlot(s, q = .86) {
    const c = document.createElement('canvas'); c.width = c.height = 900;
    drawCrop(c.getContext('2d'), s, 900);
    return c.toDataURL('image/jpeg', q);
  }
  function contactSheet(orderId, name) {
    const cols = bundle.cols, rows = Math.ceil(slots.length / cols), cell = 300, gap = 24, pad = 36, head = 110;
    const c = document.createElement('canvas');
    c.width = pad * 2 + cols * cell + (cols - 1) * gap; c.height = head + pad + rows * cell + (rows - 1) * gap;
    const x = c.getContext('2d');
    x.fillStyle = '#0b0b0b'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#E1AD01'; x.font = '64px Anton, Impact, sans-serif'; x.textBaseline = 'top';
    x.fillText(orderId, pad, 26);
    x.fillStyle = '#ffffff'; x.font = '700 22px Manrope, sans-serif'; x.textAlign = 'right';
    x.fillText(`${name} · ${bundle.name}`, c.width - pad, 36); x.textAlign = 'left';
    slots.forEach((s, i) => {
      const cx = pad + (i % cols) * (cell + gap), cy = head + Math.floor(i / cols) * (cell + gap);
      const t = document.createElement('canvas'); t.width = t.height = cell; drawCrop(t.getContext('2d'), s, cell);
      x.save(); x.beginPath();
      const round = bundle.shape === 'round' || bundle.items[i] !== 'magnet';
      round ? x.arc(cx + cell / 2, cy + cell / 2, cell / 2, 0, Math.PI * 2) : (x.roundRect ? x.roundRect(cx, cy, cell, cell, 16) : x.rect(cx, cy, cell, cell));
      x.clip(); x.drawImage(t, cx, cy); x.restore();
      x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(cx + 8, cy + 8, 58, 30);
      x.fillStyle = '#fff'; x.font = '800 18px Manrope, sans-serif'; x.fillText(`#${i + 1}`, cx + 16, cy + 13);
    });
    return c.toDataURL('image/jpeg', .85);
  }
  function makeOrderId() {
    const n = Math.floor(100 + Math.random() * 900);
    const l = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    return `${CFG.orderPrefix}-${n}${l}`;
  }

  const postJson = async (url, body) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || 'failed');
    return out;
  };
  const toBlob = dataUrl => fetch(dataUrl).then(r => r.blob());

  $('#submitBtn').addEventListener('click', async () => {
    const name = $('#evName').value.trim();
    const tapUrl = bundle.tap ? cleanTapUrl($('#evTap').value) : '';
    if (!name || slots.some(s => !s) || (bundle.tap && !tapUrl)) { update(); return; }
    const btn = $('#submitBtn'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      // 1. reserve an order number + get one-time upload links for each photo
      const pre = await postJson('/api/event-order/prepare', { orderId: makeOrderId(), eventSlug, count: slots.length });
      const orderId = pre.orderId;
      const sheet = contactSheet(orderId, name);
      // email-only mode: a bit lighter so 9 photos fit in one request
      const photos = slots.map(sl => exportSlot(sl, pre.mode === 'email' ? .75 : .86));

      // 2. upload the cropped photos + overview sheet straight to Supabase Storage
      let paths = [], sheetPath = null;
      if (pre.mode === 'storage') {
        const { uploadToSignedUrl } = await import('@/lib/supabase/browser');
        let done = 0;
        const files = [...photos.map((p, i) => [pre.uploads[i], p]), [pre.sheet, sheet]];
        const queue = files.slice();
        const worker = async () => {
          while (queue.length) {
            const [u, dataUrl] = queue.shift();
            await uploadToSignedUrl(pre.bucket, u.path, u.token, await toBlob(dataUrl));
            done++; btn.textContent = `Uploading ${Math.min(done, photos.length)} of ${photos.length}…`;
          }
        };
        await Promise.all([worker(), worker(), worker()]);
        paths = pre.uploads.map(u => u.path); sheetPath = pre.sheet.path;
        btn.textContent = 'Sending…';
      }

      // 3. confirm the order (saved to the database, staff notified)
      const out = await postJson('/api/event-order', {
        orderId, reservation: pre.reservation, event: eventName, eventSlug, bundle: bundle.name, bundleId: bundle.id,
        items: bundle.items, shape: bundle.shape, price: bundle.price || null,
        name, phone: $('#evPhone').value.trim(), email: $('#evEmail').value.trim(), note: $('#evNote').value.trim(),
        ...(tapUrl ? { tapUrl } : {}),
        photos: paths, sheet: sheetPath, demo: !!pre.demo, mode: pre.mode,
        // no Supabase yet: the photos travel with the order straight into the owner's email
        ...(pre.mode === 'email' ? { photoData: photos, sheetData: sheet } : {})
      });
      const ready = new Date(Date.now() + CFG.readyMinutes[1] * 60000);
      const ticket = {
        orderId, token: out.token || null, name, bundle: bundle.name, tapUrl: tapUrl || null, event: eventName,
        price: priced(bundle) ? `${priced(bundle).line} at the booth` : 'At the booth',
        ready: ready.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sheet, demo: !!out.demo, at: Date.now()
      };
      try { localStorage.setItem('nxTicket', JSON.stringify(ticket)); } catch (e) { /* storage full or blocked */ }
      showTicket(ticket);
    } catch (err) {
      console.error(err);
      btn.disabled = false; update();
      alert('Hmm, that didn\'t go through. Check your connection and try again, or show your photos to Neeks at the booth.');
    }
  });

  function showTicket(t) {
    $('#orderView').hidden = true; $('#ticketView').hidden = false;
    $('#tNum').textContent = t.orderId; $('#tTime').textContent = t.ready;
    $('#tName').textContent = t.name; $('#tBundle').textContent = t.bundle;
    $('#tTap').textContent = t.tapUrl || ''; $('#tTap').hidden = $('#tTapLabel').hidden = !t.tapUrl;
    $('#tEvent').textContent = t.event;
    $('#tPrice').textContent = t.price; $('#tSheet').src = t.sheet; $('#tDemo').hidden = !t.demo;
    $('#tStatus').textContent = t.demo ? 'Demo order' : STATUS_LABEL.new;
    window.scrollTo(0, 0);
    startPolling(t);
  }

  // live status from the staff dashboard: Received → Pressing now → Ready for pickup
  function startPolling(t) {
    clearInterval(pollTimer);
    if (t.demo || !t.token) return;
    const check = async () => {
      try {
        const r = await fetch(`/api/event-order/status?id=${encodeURIComponent(t.orderId)}&t=${encodeURIComponent(t.token)}`, { cache: 'no-store' });
        const out = await r.json();
        if (!out.ok) return;
        const el = $('#tStatus'); if (!el) return;
        el.textContent = STATUS_LABEL[out.status] || out.status;
        el.dataset.status = out.status;
        if (out.status === 'ready' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (['picked_up', 'cancelled'].includes(out.status)) clearInterval(pollTimer);
      } catch (e) { /* offline for a moment, try again next tick */ }
    };
    check();
    pollTimer = setInterval(check, 15000);
  }
  $('#newOrderBtn').addEventListener('click', () => {
    clearInterval(pollTimer);
    try { localStorage.removeItem('nxTicket'); } catch (e) {}
    slots = Array(bundle.items.length).fill(null); spare = [];
    $('#detailsForm').reset();
    $('#ticketView').hidden = true; $('#orderView').hidden = false;
    renderSlots(); update(); window.scrollTo(0, 0);
  });

  /* ---------- init ---------- */
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('nxTicket') || 'null'); } catch (e) {}
  slots = Array(bundle.items.length).fill(null);
  renderBundles(); renderSlots(); update();
  if (saved && saved.orderId && Date.now() - (saved.at || 0) < 3 * 3600e3 && params.get('new') !== '1') showTicket(saved);

  return () => clearInterval(pollTimer);
}

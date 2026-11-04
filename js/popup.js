/* NeeksxArt Live: QR codes for the pop-ups page and the booth poster */
(function () {
  const $ = s => document.querySelector(s);
  const slug = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'pop-up';
  const guestUrl = name => `${location.origin}/event?e=${encodeURIComponent(slug(name))}`;

  // QR → crisp SVG (quiet zone included)
  function qrSvg(text, dark = '#0b0b0b', light = '#ffffff') {
    const q = window.NXQR(text, 'M'), n = q.getModuleCount(), m = 4, size = n + m * 2;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${size}" height="${size}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
  }

  // bundle cards (pop-ups page) + compact list (poster)
  const B = window.NX_BUNDLES || [];
  const icon = b => `<span class="bundle-ico" style="grid-template-columns:repeat(${b.cols},1fr)">${b.items.map(k => `<i class="${b.shape === 'round' || k !== 'magnet' ? 'round' : ''}"></i>`).join('')}</span>`;
  const pb = $('#popBundles');
  if (pb) pb.innerHTML = B.map(b => `
    <article class="pop-bundle reveal in">
      ${b.tag ? `<span class="tag">${b.tag}</span>` : ''}
      ${icon(b)}
      <h3>${b.name}</h3>
      <p>${b.blurb}</p>
      <span class="count">${b.items.length} pieces · ${b.price || 'Priced at the booth'}</span>
    </article>`).join('');
  const pp = $('#posterPacks');
  if (pp) pp.innerHTML = B.map(b => `<div>${icon(b)}<b>${b.name}</b>${b.price ? `<span>${b.price}</span>` : ''}</div>`).join('');

  // "try it" QR on the pop-ups page
  const tq = $('#tryQr');
  if (tq) tq.innerHTML = qrSvg(`${location.origin}/event?e=demo&new=1`);

  // booth poster
  const ev = $('#boothEvent');
  if (ev) {
    const headIn = $('#boothHeadline');
    const render = () => {
      const url = guestUrl(ev.value || 'Pop-Up');
      $('#boothLink').textContent = url;
      $('#openGuest').href = url + '&new=1';
      $('#posterQr').innerHTML = qrSvg(url);
      $('#posterEvent').textContent = ev.value || 'Pop-Up';
      $('#posterHead').textContent = headIn.value || 'Your photos, pressed while you wait';
      try { localStorage.setItem('nxBooth', JSON.stringify({ e: ev.value, h: headIn.value })); } catch (e) {}
    };
    try { const s = JSON.parse(localStorage.getItem('nxBooth') || 'null'); if (s) { ev.value = s.e || ev.value; headIn.value = s.h || headIn.value; } } catch (e) {}
    const fromUrl = new URLSearchParams(location.search).get('e'); if (fromUrl) ev.value = fromUrl;
    ev.addEventListener('input', render); headIn.addEventListener('input', render);
    $('#printBtn').addEventListener('click', () => window.print());
    $('#copyLink').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#boothLink').textContent); $('#copyLink').textContent = 'Copied!'; }
      catch (e) { $('#copyLink').textContent = 'Select & copy'; }
      setTimeout(() => $('#copyLink').textContent = 'Copy', 1600);
    });
    $('#dlQr').addEventListener('click', () => {
      const q = window.NXQR(guestUrl(ev.value || 'Pop-Up'), 'M'), n = q.getModuleCount(), m = 4, px = 24;
      const c = document.createElement('canvas'); c.width = c.height = (n + m * 2) * px;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#0b0b0b';
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + m) * px, (r + m) * px, px, px);
      const a = document.createElement('a'); a.download = `neeksxart-qr-${slug(ev.value)}.png`; a.href = c.toDataURL('image/png'); a.click();
    });
    render();
  }
})();

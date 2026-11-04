/* =========================================================
   NeeksxArt catalog + pricing (single source of truth)
   Prices match the NeeksxArt price sheet (effective Nov 1, 2026).
   Edit a product here and every page updates:
   - tiers:   [min qty, price each]  (a tier runs until the next min)
   - packs:   optional fixed pack prices
   - special: true = design consultation / email before ordering
   ========================================================= */
(function () {
  const CDN = 'https://cdn.shopify.com/s/files/1/0858/2486/4477/files/';
  const img = (f, w = 900) => CDN + f + (f.includes('?') ? '&' : '?') + 'width=' + w;
  const EMAIL = 'info@neeksxart.com';

  const P = [
    { id: 'mag25', group: 'Magnets', name: '2.5-inch Square Magnets', short: 'Standard custom pricing',
      desc: 'Our signature square photo and logo magnets. Glossy, bold and built to live on the fridge for years. Free digital mockup before anything is printed.',
      studio: 'magnet', collection: ['magnets'], tag: 'Best seller',
      tiers: [[1, 6], [10, 5.5], [25, 4.75], [50, 4], [100, 3.5], [250, 2.75]],
      packs: [[10, 55], [25, 118.75], [50, 200], [100, 350], [250, 687.5]],
      imgs: ['1657F592-FD8E-4414-B721-BC966EBF46E9.png?v=1792660584', 'IMG_5584.png?v=1791809165', 'E159D128-EFBD-4295-87F3-F221B6D8ADBD.jpg?v=1792031283', 'C80D7051-3B56-4474-9024-26056A097B7E_1_102_o.jpg?v=1792031283', 'A68EF4F0-7798-4A98-BF58-839860AE70BE.png?v=1792031283', '58FD260A-742D-42DD-A6B7-348BF7BA7237.png?v=1792031284', 'FB911656-9950-4002-8651-09584AFC2C1E.png?v=1792031283'] },
    { id: 'mag225', group: 'Magnets', name: '2.25-inch Circular Magnets', short: 'Round glossy magnets',
      desc: 'Round, domed magnets for logos, photos and party favors. No minimum, with better pricing as your quantity grows.',
      studio: 'magnet', collection: ['magnets'],
      tiers: [[1, 5], [10, 4.5], [25, 4], [50, 3.5], [100, 3]],
      imgs: ['dji_mimo_20260902_203854_20260902203853_1788409166260_photo.jpg?v=1792030020', '87DC9E8B-814D-48D0-A085-8D4F1F9DBB7D.png?v=1792030016'] },
    { id: 'btn1', group: 'Pin buttons', name: '1-inch Pin Buttons', short: 'Mini pin-back buttons',
      desc: 'Small, punchy pin-backs for jackets, lanyards, merch tables and giveaways.',
      studio: 'button', collection: [],
      tiers: [[1, 1.5], [25, 1], [50, 0.85], [100, 0.7], [250, 0.6]],
      imgs: ['IMG_5597.png?v=1791857737', 'IMG_5596.png?v=1791857737'] },
    { id: 'btn225', group: 'Pin buttons', name: '2.25-inch Pin Buttons', short: 'Classic statement buttons',
      desc: 'The classic button size. Big enough for full artwork, photos and campaign logos.',
      studio: 'button', collection: [],
      tiers: [[1, 3], [25, 2], [50, 1.75], [100, 1.5], [250, 1.25]],
      local: ['/assets/img/logo-button.jpg', '/assets/img/wedding-buttons.jpg'] },
    { id: 'kc15', group: 'Keychains', name: '1.5-inch Standard Keychains', short: 'No minimum',
      desc: 'Compact domed keychains with split ring. The thing nobody throws away: their keys.',
      studio: 'keychain', collection: [],
      tiers: [[1, 4], [10, 3.75], [25, 3.25], [50, 2.75], [100, 2.5]],
      packs: [[10, 37.5], [25, 81.25], [50, 137.5], [100, 250]],
      imgs: ['F61CCAD8-25F2-49BA-85C9-70CC084B269C.png?v=1792375444', 'D03623F6-0AD3-463A-988D-0C7E9E064EBE.png?v=1792375442', '488D516D-6D25-4451-BE2D-A66515E540FC.png?v=1792375447', '3F0CBAFD-98EB-42E9-AF3E-FFB8E7EAE4C1.png?v=1792375453', '8779BEA2-1C65-4165-872C-21C71E28F9F8.png?v=1792375458'] },
    { id: 'kc225', group: 'Keychains', name: '2.25-inch Standard Metal Keychains', short: 'Full-size metal keychains',
      desc: 'Full-size metal keychains with room for detailed logos and photos.',
      studio: 'keychain', collection: [],
      tiers: [[1, 5], [10, 4.75], [25, 4.25], [50, 3.75], [100, 3]],
      local: ['/assets/img/nextlevel-2.jpg', '/assets/img/nextlevel-1.jpg'] },
    { id: 'mirror225', group: 'Mirror keychains', name: '2.25-inch Custom Mirror Keychains', short: 'Full package', special: true, tag: 'Full package',
      desc: 'Your design on the front, a real mirror on the back. Every order includes matching backer cards, a Sandy Mylar finish, your tassel color, gold or silver hardware and individual cello packaging.',
      studio: 'mirror', collection: [],
      tiers: [[1, 10], [10, 8.5], [20, 7.5], [50, 7], [100, 6.5]],
      imgs: ['2A7090E1-1C75-450B-9070-3E9F3780C728.png?v=1792375561', 'E9B09DDF-0EB3-4B0C-BAE4-999A16DC3DD5.png?v=1792375564', '21335C44-21E7-4E7D-95F1-862AEE4F096D.png?v=1792375565', 'FA068AC0-F80C-46A7-9CD4-009F16F8A7B1.png?v=1792375567', 'A481739B-2F30-4134-AFEA-154DA1D5AF4A.png?v=1792375569', 'EB1C9975-00D0-4BE9-9B43-8271D8A1B003.png?v=1792375571'] },
    { id: 'ttc15', group: 'Tap-to-Connect', name: '1.5-inch Tap to Connect (TTC) Keychains', short: 'NFC smart keychain', special: true,
      desc: 'A compact keychain with an NFC chip inside. One tap on a phone opens your Instagram, website, booking page or menu. No app needed.',
      studio: 'nfc', collection: [],
      tiers: [[1, 15], [5, 14], [10, 12], [25, 10], [50, 9], [100, 8]],
      imgs: ['BDA49754-DA5C-45A8-B9CC-2F4E2B34EFDB-photo-6B70F228-C00E-439E-84D7-62E8A2643A1D.jpg?v=1793672877', 'CF5E47C8-886E-485B-9FF5-3A066A15D571-photo-83B07FF2-C4CB-487F-8D80-5CA63D739993.jpg?v=1793672877', '891C0CFB-E610-4012-A73F-58B92FAC9016-photo-DAC74EBE-0D5B-4953-8A06-1866B84FBBE7.jpg?v=1793672877', '41077034-70AD-4389-BE0D-86405E2E0F25-photo-0299BEF9-1E6A-4DE6-8FD3-42359BA2E305.jpg?v=1793672877', '98A7325E-9772-4FC8-9BEE-9AA65B7F48CF-photo-1013164A-63C5-49C7-ACC9-9F7609E7ABF6.jpg?v=1793672877'] },
    { id: 'ttc225', group: 'Tap-to-Connect', name: '2.25-inch Standard Metal TTC Keychains', short: 'NFC smart keychain', special: true,
      desc: 'Our full-size metal keychain with a programmed NFC chip that links to anywhere you choose.',
      studio: 'nfc', collection: [],
      tiers: [[1, 20], [10, 17], [25, 14], [50, 11], [100, 10]],
      imgs: ['FEBBB21B-96B1-47DD-8853-348AABA6806D.png?v=1792029902', '0C132FE0-9D3C-4541-A8C4-57C042E3D5CC.png?v=1792374853', '9D7F437C-84EA-448A-9B8A-4D91FE492161.png?v=1792374860'] },
    { id: 'ttcmirror', group: 'Tap-to-Connect', name: '2.25-inch Tap-to-Connect Mirror Keychains', short: 'Mirror + NFC', special: true, tag: 'Smart merch',
      desc: 'The mirror keychain, upgraded with NFC. Your design on the front, a mirror on the back and a tap that opens your page.',
      studio: 'nfc', collection: [],
      tiers: [[1, 25], [10, 22], [25, 20], [50, 18], [100, 16], [250, 15]],
      imgs: ['IMG_5610.png?v=1791858710', 'IMG_5611.png?v=1791858711'] },
    { id: 'pocket3', group: 'Pocket mirrors', name: '3-inch Pocket Mirror', short: 'Purse-size mirror', special: true,
      desc: 'A full-size 3-inch pocket mirror with your design on the back. A gift people actually use every day.',
      studio: 'mirror', collection: [],
      tiers: [[1, 10], [10, 9.5], [25, 8], [50, 7], [100, 6.5]],
      imgs: ['3D09DAAD-366D-4391-AF04-2BEE9D7EE5E5.png?v=1792665444', 'DAAB5F99-15A9-4EBE-96E9-9E493F339554.png?v=1792665444', '0A578311-8715-4BB3-98E1-DF65E4D47ABE.png?v=1792665444', '6AABEC39-FF7A-4113-88E5-B305831F4945.png?v=1792665444'] }
  ];

  const LIVE = [
    { name: 'NeeksxArt Live Magnets', note: '2.5-inch square photo magnets, made at the event',
      packs: [['1 magnet', 7.99], ['3 magnets', 19.99], ['6 magnets', 37.99], ['9 magnets', 53.99]],
      img: 'dji_mimo_20261004_010406_20261004010405_1791101440019_photo.jpg?v=1792033143' },
    { name: 'NeeksxArt Live Personalized Keychains', note: '2.25-inch keychains, one photo per keychain',
      packs: [['1 keychain', 6.99], ['3 keychains', 17.99], ['6 keychains', 32.99], ['9 keychains', 49.99]],
      img: '0A4B9D8C-988C-4BC8-842F-40A6DB0969C8.png?v=1792376373' }
  ];

  const money = n => '$' + (Number.isInteger(n) ? n.toFixed(2) : n.toFixed(2));
  const pics = p => p.imgs ? p.imgs.map(f => img(f)) : p.local;
  const thumbs = p => p.imgs ? p.imgs.map(f => img(f, 200)) : p.local;
  const range = (t, i, all) => {
    const next = all[i + 1];
    return next ? (next[0] - 1 === t[0] ? `${t[0]}` : `${t[0]}–${next[0] - 1}`) : `${t[0]}+`;
  };
  const unitFor = (p, q) => { let u = p.tiers[0][1]; p.tiers.forEach(([m, v]) => { if (q >= m) u = v; }); return u; };
  // never pay more than the next tier's starting order would cost
  const totalFor = (p, q) => {
    let t = q * unitFor(p, q);
    p.tiers.forEach(([m, v]) => { if (m > q) t = Math.min(t, m * v); });
    (p.packs || []).forEach(([m, v]) => { if (m >= q) t = Math.min(t, v); });
    return Math.round(t * 100) / 100;
  };
  const mailto = (p, q) => `mailto:${EMAIL}?subject=${encodeURIComponent('Custom order inquiry: ' + p.name)}&body=${encodeURIComponent(`Hi NeeksxArt! I'm interested in ${q ? q + ' x ' : ''}${p.name}.\n\nMy idea / design:\n\nNeed it by:\n`)}`;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const tierTable = p => `<table class="tiers"><thead><tr><th>Qty</th><th>Each</th></tr></thead><tbody>${
    p.tiers.map((t, i, a) => `<tr><td>${range(t, i, a)}</td><td>${money(t[1])}</td></tr>`).join('')}</tbody></table>${
    p.packs ? `<div class="packs">${p.packs.map(([q, v]) => `<span><b>${q}-pack</b> ${money(v)}</span>`).join('')}</div>` : ''}`;

  function card(p) {
    const big = pics(p), small = thumbs(p);
    const badge = p.special ? '<span class="tag special">Special order</span>' : (p.tag ? `<span class="tag hot">${p.tag}</span>` : '<span class="tag">No minimum</span>');
    return `<article class="shop-card reveal" id="${p.id}">
      ${badge}
      <div class="shop-media"><img src="${big[0]}" alt="${p.name}" loading="lazy" data-main></div>
      ${big.length > 1 ? `<div class="shop-thumbs">${small.map((s, i) => `<button type="button" class="${i ? '' : 'on'}" data-src="${big[i]}" aria-label="Photo ${i + 1} of ${p.name}"><img src="${s}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      <div class="shop-body">
        <small class="shop-group">${p.group} · ${p.short}</small>
        <h3>${p.name}</h3>
        <p class="shop-from">From <strong>${money(p.tiers[p.tiers.length - 1][1])}</strong> <span>to ${money(p.tiers[0][1])} each</span></p>
        <p>${p.desc}</p>
        <details><summary>Quantity pricing</summary>${tierTable(p)}</details>
        <div class="shop-ctas">
          ${p.special
            ? `<a class="btn btn-orange" href="${mailto(p)}">Email to order ${arrow}</a><a class="link-arrow" href="/studio?product=${p.studio}">Preview it</a>`
            : `<a class="btn btn-orange" href="/studio?product=${p.studio}">Design yours ${arrow}</a><a class="link-arrow" href="/pricing?p=${p.id}#estimate">Estimate</a>`}
        </div>
      </div>
    </article>`;
  }

  // ---------- renderers ----------
  document.querySelectorAll('[data-catalog]').forEach(el => {
    const c = el.dataset.catalog;
    let list = P;
    if (c === 'magnets') list = P.filter(p => p.collection.includes('magnets'));
    else if (c === 'standard') list = P.filter(p => !p.special);
    else if (c === 'special') list = P.filter(p => p.special);
    el.innerHTML = list.map(card).join('');
  });

  document.querySelectorAll('[data-price-tables]').forEach(el => {
    const groups = [...new Set(P.map(p => p.group))];
    el.innerHTML = groups.map(g => `<div class="price-group reveal"><h3>${g}</h3>${
      P.filter(p => p.group === g).map(p => `<div class="price-row"><div><strong>${p.name}</strong>${p.special ? '<em>Special order · email inquiry</em>' : '<em>No minimum</em>'}</div>${tierTable(p)}</div>`).join('')}</div>`).join('');
  });

  document.querySelectorAll('[data-live]').forEach(el => {
    el.innerHTML = LIVE.map(l => `<div class="live-card reveal"><img src="${img(l.img, 700)}" alt="${l.name}" loading="lazy"><div><h3>${l.name}</h3><p>${l.note}</p><ul>${
      l.packs.map(([n, v]) => `<li><span>${n}</span><b>${money(v)}</b></li>`).join('')}</ul></div></div>`).join('');
  });

  const est = document.querySelector('[data-estimator]');
  if (est) {
    const pre = new URLSearchParams(location.search).get('p');
    est.innerHTML = `<div class="est-grid">
      <div class="est-controls">
        <div class="field"><label for="estP">Product</label><select id="estP">${P.map(p => `<option value="${p.id}"${p.id === pre ? ' selected' : ''}>${p.name}${p.special ? ' (special order)' : ''}</option>`).join('')}</select></div>
        <div class="field"><label for="estQ">Quantity</label>
          <div class="qty"><button type="button" data-step="-1" aria-label="Fewer">−</button><input id="estQ" type="number" min="1" max="10000" value="25" inputmode="numeric"><button type="button" data-step="1" aria-label="More">+</button></div>
          <div class="qty-quick">${[1, 10, 25, 50, 100, 250].map(q => `<button type="button" data-q="${q}">${q}</button>`).join('')}</div>
        </div>
      </div>
      <div class="est-out">
        <img id="estImg" alt="">
        <small>Estimated subtotal</small>
        <div class="est-total" id="estTotal">$0.00</div>
        <p id="estEach"></p>
        <p id="estNext" class="est-next"></p>
        <a class="btn btn-orange" id="estGo" href="#">Start this order ${arrow}</a>
        <small class="est-fine">Before tax and shipping. Your final quote is confirmed with your free mockup.</small>
      </div>
    </div>`;
    const sel = est.querySelector('#estP'), qi = est.querySelector('#estQ');
    const draw = () => {
      const p = P.find(x => x.id === sel.value);
      let q = Math.max(1, Math.min(10000, parseInt(qi.value, 10) || 1));
      const t = totalFor(p, q), u = unitFor(p, q);
      est.querySelector('#estImg').src = pics(p)[0];
      est.querySelector('#estTotal').textContent = money(t);
      est.querySelector('#estEach').textContent = `${q} × ${p.name} · ${money(t / q)} each`;
      const nxt = p.tiers.find(([m]) => m > q);
      est.querySelector('#estNext').textContent = nxt ? `Order ${nxt[0]} and the price drops to ${money(nxt[1])} each.` : `You're at our best price per piece.`;
      const go = est.querySelector('#estGo');
      if (p.special) { go.href = mailto(p, q); go.firstChild.textContent = 'Email to order '; }
      else { go.href = `/studio?product=${p.studio}`; go.firstChild.textContent = 'Design it now '; }
      if (u === 0) return;
    };
    sel.addEventListener('change', draw);
    qi.addEventListener('input', draw);
    est.addEventListener('click', e => {
      const s = e.target.closest('[data-step]'), b = e.target.closest('[data-q]');
      if (s) qi.value = Math.max(1, (parseInt(qi.value, 10) || 1) + +s.dataset.step);
      if (b) qi.value = b.dataset.q;
      if (s || b) draw();
    });
    draw();
  }

  // thumbnail swapping
  document.addEventListener('click', e => {
    const b = e.target.closest('.shop-thumbs button'); if (!b) return;
    const card = b.closest('.shop-card');
    card.querySelector('[data-main]').src = b.dataset.src;
    card.querySelectorAll('.shop-thumbs button').forEach(x => x.classList.toggle('on', x === b));
  });

  window.NX_CATALOG = { products: P, live: LIVE, img, email: EMAIL };
})();

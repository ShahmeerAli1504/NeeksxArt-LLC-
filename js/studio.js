/* =========================================================
   NeeksxArt Merch Studio — live canvas mockup renderer
   ========================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const canvas = $('#preview');
  const ctx = canvas.getContext('2d');
  const W = 1000;                // logical drawing size
  const RES = 1.4;               // internal resolution multiplier
  canvas.width = W * RES; canvas.height = W * RES;
  const PPI = 168;               // px per inch in the preview

  const PRODUCTS = {
    keychain: { label: 'Custom Keychain', sizes: [1.75, 2.25, 3], def: 2.25, hang: true, loop: 'metal', rim: 'metal' },
    mirror:   { label: 'Mirror Keychain', sizes: [2.25, 3], def: 3, hang: true, loop: 'tab', rim: 'plastic' },
    magnet:   { label: 'Magnet', sizes: [1.75, 2.25, 3], def: 2.25, hang: false, shapes: true, rim: 'none' },
    button:   { label: 'Button', sizes: [1.25, 1.75, 2.25, 3], def: 2.25, hang: false, rim: 'metal' },
    nfc:      { label: 'Tap-to-Connect Keychain', sizes: [2.25, 3], def: 2.25, hang: true, loop: 'metal', rim: 'metal', nfc: true }
  };
  const METALS = {
    silver: ['#ffffff', '#9c9c9c', '#e6e6e6', '#6a6a6a'],
    gold:   ['#fff3c4', '#b5832a', '#f4d37c', '#87600f'],
    black:  ['#6a6a6a', '#141414', '#444444', '#000000']
  };
  const SCENES = {
    studio: ['#2c2c2c', '#0c0c0c'],
    paper:  ['#fbf6ee', '#ddd2bf'],
    pink:   ['#ff8cc2', '#d81f72'],
    orange: ['#f79a6a', '#c94c14']
  };

  const S = {
    product: 'keychain', size: 2.25, shape: 'round', finish: 'gloss', metal: 'silver', tassel: 'none',
    bg: '#0b0b0b', img: null, imgSrc: null, knock: false, scale: 1, rot: 0, ox: 0, oy: 0,
    text: '', font: 'script', textPos: 'arc-bottom', textColor: '#ffffff',
    nfcUrl: '', nfcIcon: true, pack: 'none', qty: 50, needBy: '',
    side: 'front', scene: 'studio', fileName: '', fileData: null
  };

  /* ---------- helpers ---------- */
  const lum = hex => {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  const shade = (hex, amt) => {
    const n = parseInt(hex.replace('#', ''), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const metalGrad = (x0, y0, x1, y1) => {
    const m = METALS[S.metal], g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, m[0]); g.addColorStop(.35, m[1]); g.addColorStop(.6, m[2]); g.addColorStop(1, m[3]);
    return g;
  };
  // deterministic pseudo-random for tassel strands
  const rand = (i) => { const x = Math.sin(i * 999.13) * 43758.5453; return x - Math.floor(x); };

  function geometry() {
    const P = PRODUCTS[S.product];
    const r = (S.size * PPI) / 2;
    const cx = W / 2;
    const cy = P.hang ? 590 + (3 - S.size) * 18 : 510;
    const top = cy - r;
    const ringR = 58;
    const chainTop = top - 30 - 95;
    const ringCy = chainTop - ringR + 8;
    return { P, r, cx, cy, top, ringR, chainTop, ringCy };
  }

  function facePath(g) {
    const { cx, cy, r } = g;
    ctx.beginPath();
    if (S.shape === 'square' && PRODUCTS[S.product].shapes) {
      const k = r * .16;
      ctx.roundRect ? ctx.roundRect(cx - r, cy - r, r * 2, r * 2, k) : ctx.rect(cx - r, cy - r, r * 2, r * 2);
    } else ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }

  /* ---------- scene, card, sleeve ---------- */
  function drawScene() {
    const [a, b] = SCENES[S.scene];
    const g = ctx.createRadialGradient(W / 2, W * .42, 50, W / 2, W / 2, W * .75);
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
  }
  function packBounds(g) {
    const top = g.P.hang ? g.ringCy - g.ringR - 70 : g.cy - g.r - 120;
    const bottom = g.cy + g.r + 150;
    const half = Math.max(g.r + 110, 230);
    return { x: g.cx - half, y: top, w: half * 2, h: bottom - top };
  }
  function drawCard(g) {
    const b = packBounds(g);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const cg = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    const dark = lum(S.bg) < .5;
    cg.addColorStop(0, shade(S.bg, dark ? .14 : -.04)); cg.addColorStop(1, shade(S.bg, dark ? .02 : -.16));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(b.x, b.y, b.w, b.h, 22) : ctx.rect(b.x, b.y, b.w, b.h); ctx.fill();
    ctx.restore();
    // inner frame line
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.15)'; ctx.lineWidth = 2;
    ctx.strokeRect(b.x + 18, b.y + 18, b.w - 36, b.h - 36);
    // label in script
    ctx.fillStyle = dark ? '#ffffff' : '#141414';
    ctx.font = `${Math.min(64, b.w / 7)}px Yellowtail`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(PRODUCTS[S.product].label.replace('Custom ', '').replace(' Keychain', ' Keychain'), g.cx, b.y + b.h - 72);
  }
  function drawSleeve(g) {
    const b = packBounds(g);
    const x = b.x - 22, y = b.y - 70, w = b.w + 44, h = b.h + 92;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
    // resealable strip + euro hole
    ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fillRect(x, y, w, 64);
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(x, y + 64); ctx.lineTo(x + w, y + 64); ctx.stroke();
    ctx.fillStyle = SCENES[S.scene][0];
    ctx.beginPath(); ctx.arc(g.cx, y + 30, 13, 0, Math.PI * 2); ctx.fill();
    // diagonal glare
    const gl = ctx.createLinearGradient(x, y, x + w, y + h);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.42, 'rgba(255,255,255,0)');
    gl.addColorStop(.47, 'rgba(255,255,255,.16)'); gl.addColorStop(.55, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  /* ---------- hardware ---------- */
  function drawRing(g) {
    const { cx, ringCy, ringR } = g;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    ctx.lineWidth = 8; ctx.strokeStyle = metalGrad(cx - ringR, ringCy - ringR, cx + ringR, ringCy + ringR);
    ctx.beginPath(); ctx.arc(cx, ringCy, ringR, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, ringCy, ringR - 7, Math.PI * .1, Math.PI * 1.9); ctx.stroke();
    ctx.restore();
  }
  function drawChain(g) {
    const { cx, top, ringCy, ringR, P } = g;
    const y0 = ringCy + ringR - 6, y1 = top - (P.loop === 'tab' ? 30 : 22);
    const n = Math.max(3, Math.round((y1 - y0) / 22));
    const step = (y1 - y0) / n;
    ctx.save();
    for (let i = 0; i <= n; i++) {
      const y = y0 + i * step;
      ctx.strokeStyle = metalGrad(cx - 12, y - 14, cx + 12, y + 14);
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      if (i % 2 === 0) ctx.ellipse(cx, y, 9, 15, 0, 0, Math.PI * 2);
      else { ctx.moveTo(cx, y - 13); ctx.lineTo(cx, y + 13); ctx.lineWidth = 7; }
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawLoop(g) {
    const { cx, top, P } = g;
    if (P.loop === 'tab') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#f2f2f2';
      ctx.beginPath();
      ctx.moveTo(cx - 46, top + 22); ctx.quadraticCurveTo(cx - 20, top - 30, cx, top - 44);
      ctx.quadraticCurveTo(cx + 20, top - 30, cx + 46, top + 22); ctx.closePath(); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(cx, top - 22, 8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.lineWidth = 7; ctx.strokeStyle = metalGrad(cx - 16, top - 30, cx + 16, top);
      ctx.beginPath(); ctx.arc(cx, top - 12, 13, Math.PI * .85, Math.PI * 2.15); ctx.stroke();
      ctx.restore();
    }
  }
  function drawTassel(g) {
    if (S.tassel === 'none') return;
    const { cx, ringCy, ringR } = g;
    const ax0 = cx - ringR * .78, ay0 = ringCy + ringR * .55;
    ctx.save();
    ctx.translate(ax0, ay0); ctx.rotate(.62);
    const ax = 0, ay = 0;
    // jump ring
    ctx.lineWidth = 5; ctx.strokeStyle = metalGrad(ax - 10, ay - 10, ax + 10, ay + 10);
    ctx.beginPath(); ctx.arc(ax, ay + 10, 10, 0, Math.PI * 2); ctx.stroke();
    // cap
    const capX = ax - 14, capY = ay + 18;
    ctx.fillStyle = metalGrad(capX, capY, capX + 28, capY);
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(capX, capY, 28, 40, [14, 14, 4, 4]) : ctx.rect(capX, capY, 28, 40); ctx.fill();
    // strands
    const len = 175, base = S.tassel;
    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      const sx = capX + 3 + t * 22;
      const ex = capX - 16 + t * 60 + (rand(i) - .5) * 10;
      const ey = capY + 40 + len - rand(i + 50) * 22;
      ctx.strokeStyle = i % 3 === 0 ? shade(base, -.22) : i % 3 === 1 ? base : shade(base, .12);
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, capY + 38);
      ctx.quadraticCurveTo(sx + (ex - sx) * .2, capY + 40 + len * .5, ex, ey); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- face: front ---------- */
  function drawArt(g) {
    if (!S.img) return;
    const { cx, cy, r } = g;
    const iw = S.img.width, ih = S.img.height;
    const base = (r * 2 * .78) / Math.max(iw, ih);
    const k = base * S.scale;
    ctx.save();
    ctx.translate(cx + S.ox * r, cy + S.oy * r);
    ctx.rotate(S.rot * Math.PI / 180);
    ctx.drawImage(S.img, -iw * k / 2, -ih * k / 2, iw * k, ih * k);
    ctx.restore();
  }
  function fontFor(r) {
    if (S.font === 'script') return { f: `${Math.round(r * .2)}px Yellowtail`, up: false, sp: 0 };
    if (S.font === 'bold') return { f: `${Math.round(r * .15)}px Anton`, up: true, sp: r * .012 };
    return { f: `800 ${Math.round(r * .1)}px Manrope`, up: true, sp: r * .03 };
  }
  function drawText(g) {
    if (!S.text.trim()) return;
    const { cx, cy, r } = g;
    const { f, up, sp } = fontFor(r);
    const txt = up ? S.text.toUpperCase() : S.text;
    ctx.save();
    ctx.font = f; ctx.fillStyle = S.textColor; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 4;
    const square = S.shape === 'square' && PRODUCTS[S.product].shapes;
    if ((S.textPos === 'arc-bottom' || S.textPos === 'arc-top') && !square) {
      const rad = r * (S.font === 'script' ? .76 : .8);
      const chars = [...txt];
      const widths = chars.map(c => ctx.measureText(c).width + sp);
      const total = widths.reduce((a, b) => a + b, 0) - sp;
      const span = total / rad;
      let acc = 0;
      chars.forEach((c, i) => {
        const w = widths[i];
        let a;
        ctx.save();
        if (S.textPos === 'arc-top') {
          a = -Math.PI / 2 - span / 2 + (acc + (w - sp) / 2) / rad;
          ctx.translate(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); ctx.rotate(a + Math.PI / 2);
        } else {
          a = Math.PI / 2 + span / 2 - (acc + (w - sp) / 2) / rad;
          ctx.translate(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); ctx.rotate(a - Math.PI / 2);
        }
        ctx.fillText(c, 0, 0); ctx.restore();
        acc += w;
      });
    } else {
      const y = S.textPos === 'center' ? cy : (S.textPos === 'arc-top' ? cy - r * .66 : cy + r * .64);
      if (sp && 'letterSpacing' in ctx) ctx.letterSpacing = `${sp}px`;
      ctx.fillText(txt, cx, y, r * 1.6);
    }
    ctx.restore();
  }
  function drawNfcMark(g, x, y, size, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = size * .14;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(x - size * .5, y, size * (.35 + i * .3), -Math.PI / 4, Math.PI / 4); ctx.stroke();
    }
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x - size * .5, y, size * .12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawGloss(g) {
    const { cx, cy, r } = g;
    if (S.finish === 'gloss') {
      const hl = ctx.createRadialGradient(cx - r * .38, cy - r * .58, 0, cx - r * .3, cy - r * .5, r * 1.05);
      hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(.18, 'rgba(255,255,255,.18)'); hl.addColorStop(.42, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      // crescent highlight along top-left edge (round faces only)
      if (!(S.shape === 'square' && PRODUCTS[S.product].shapes)) { ctx.save(); ctx.globalAlpha = .45; ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .035; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, r * .9, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke(); ctx.restore(); }
      // tiny specular
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.ellipse(cx + r * .52, cy + r * .5, r * .05, r * .025, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    const vg = ctx.createRadialGradient(cx, cy, r * .7, cx, cy, r * 1.02);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, S.finish === 'gloss' ? 'rgba(0,0,0,.38)' : 'rgba(0,0,0,.2)');
    ctx.fillStyle = vg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  /* ---------- face: back ---------- */
  function drawBack(g) {
    const { cx, cy, r, P } = g;
    if (S.product === 'mirror') {
      const mg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      mg.addColorStop(0, '#f4f6f8'); mg.addColorStop(.3, '#b9c0c7'); mg.addColorStop(.5, '#eef1f4');
      mg.addColorStop(.7, '#9aa3ab'); mg.addColorStop(1, '#dfe3e7');
      ctx.fillStyle = mg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = SCENES[S.scene][1]; ctx.globalAlpha = .18; ctx.fillRect(cx - r, cy, r * 2, r); ctx.globalAlpha = 1;
      ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(cx - r * .9, cy - r * .2); ctx.lineTo(cx - r * .2, cy - r * .9); ctx.lineTo(cx - r * .05, cy - r * .9); ctx.lineTo(cx - r * .9, cy - r * .05); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - r * .7, cy + r * .2); ctx.lineTo(cx + r * .2, cy - r * .7); ctx.lineTo(cx + r * .26, cy - r * .64); ctx.lineTo(cx - r * .64, cy + r * .26); ctx.fill();
      ctx.restore();
      return;
    }
    if (S.product === 'magnet') {
      const bg = ctx.createRadialGradient(cx - r * .3, cy - r * .3, 0, cx, cy, r);
      bg.addColorStop(0, '#3a3a3a'); bg.addColorStop(1, '#141414');
      ctx.fillStyle = bg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      const mg = ctx.createRadialGradient(cx - r * .1, cy - r * .1, 0, cx, cy, r * .42);
      mg.addColorStop(0, '#8a8a8a'); mg.addColorStop(1, '#3d3d3d');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, r * .4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = `800 ${r * .09}px Manrope`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MAGNET', cx, cy + r * .62);
      return;
    }
    // metal back: button, keychain, nfc
    const sg = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .05, cx, cy, r * 1.05);
    const m = S.product === 'button' ? METALS.silver : METALS[S.metal];
    sg.addColorStop(0, m[0]); sg.addColorStop(.45, m[2]); sg.addColorStop(1, m[1]);
    ctx.fillStyle = sg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 3;
    [.86, .7].forEach(k => { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.stroke(); });
    if (S.product === 'button') {
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#7d7d7d'; ctx.lineWidth = r * .045;
      ctx.beginPath(); ctx.moveTo(cx - r * .55, cy + r * .12); ctx.lineTo(cx + r * .5, cy + r * .12); ctx.stroke();
      ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = r * .02;
      ctx.beginPath(); ctx.moveTo(cx - r * .55, cy + r * .1); ctx.lineTo(cx + r * .5, cy + r * .1); ctx.stroke();
      ctx.strokeStyle = '#8c8c8c'; ctx.lineWidth = r * .05;
      ctx.beginPath(); ctx.arc(cx - r * .55, cy + r * .02, r * .1, Math.PI * .5, Math.PI * 1.5); ctx.stroke();
      ctx.restore();
    }
    if (P.nfc) {
      ctx.save();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r * .5, 0, Math.PI * 2); ctx.fill();
      ctx.setLineDash([r * .04, r * .03]); ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r * .44, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      drawNfcMark(g, cx + r * .12, cy - r * .1, r * .2, '#111');
      ctx.fillStyle = '#111'; ctx.font = `800 ${r * .075}px Manrope`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NFC CHIP INSIDE', cx, cy + r * .22);
      ctx.restore();
    }
  }

  /* ---------- main draw ---------- */
  function draw() {
    const g = geometry();
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.clearRect(0, 0, W, W);
    drawScene();
    if (S.pack === 'card') drawCard(g);
    if (g.P.hang) { drawRing(g); drawChain(g); drawLoop(g); }

    // body with drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26;
    facePath(g); ctx.fillStyle = S.side === 'back' && S.product !== 'mirror' ? '#999' : S.bg; ctx.fill();
    ctx.restore();

    ctx.save(); facePath(g); ctx.clip();
    if (S.side === 'front') {
      ctx.fillStyle = S.bg; ctx.fillRect(g.cx - g.r, g.cy - g.r, g.r * 2, g.r * 2);
      drawArt(g);
      drawText(g);
      if (g.P.nfc && S.nfcIcon) drawNfcMark(g, g.cx + g.r * .58, g.cy + g.r * .42, g.r * .17, lum(S.bg) > .6 ? '#111' : '#fff');
      drawGloss(g);
    } else {
      drawBack(g);
      if (S.product !== 'mirror') {
        const vg = ctx.createRadialGradient(g.cx, g.cy, g.r * .75, g.cx, g.cy, g.r);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.3)');
        ctx.fillStyle = vg; ctx.fillRect(g.cx - g.r, g.cy - g.r, g.r * 2, g.r * 2);
      }
    }
    ctx.restore();

    // rim (buttons always have a silver shell)
    const savedMetal = S.metal; if (S.product === 'button') S.metal = 'silver';
    ctx.save(); facePath(g);
    if (g.P.rim === 'metal') { ctx.lineWidth = Math.max(4, g.r * .028); ctx.strokeStyle = metalGrad(g.cx - g.r, g.cy - g.r, g.cx + g.r, g.cy + g.r); }
    else if (g.P.rim === 'plastic') { ctx.lineWidth = g.r * .05; ctx.strokeStyle = S.side === 'back' ? shade(S.bg, .05) : 'rgba(255,255,255,.25)'; }
    else { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.3)'; }
    ctx.stroke(); ctx.restore();
    S.metal = savedMetal;

    if (g.P.hang) drawTassel(g);
    if (S.pack !== 'none') drawSleeve(g);

    $('#sizeReadout').textContent = `${S.size}″ · ${Math.round(S.size * 25.4)} mm`;
    renderSummary();
  }

  /* ---------- image handling ---------- */
  function loadImage(src, opts = {}) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => res(im); im.onerror = rej; im.src = src;
    });
  }
  // rasterise to a capped-size canvas (handles SVG + huge photos)
  function toCanvas(im) {
    let w = im.naturalWidth || im.width || 800, h = im.naturalHeight || im.height || 800;
    const max = 1600, k = Math.min(1, max / Math.max(w, h));
    if (!w || !h) { w = h = 800; }
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    return c;
  }
  function knockWhite(src) {
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const m = Math.min(p[i], p[i + 1], p[i + 2]);
      if (m > 245) p[i + 3] = 0;
      else if (m > 215) p[i + 3] = Math.round(p[i + 3] * (245 - m) / 30);
    }
    x.putImageData(d, 0, 0); return c;
  }
  function cornerColor(c) {
    try {
      const x = c.getContext('2d');
      const pts = [[2, 2], [c.width - 3, 2], [2, c.height - 3], [c.width - 3, c.height - 3]].map(([a, b]) => x.getImageData(a, b, 1, 1).data);
      if (pts.some(p => p[3] < 250)) return null;
      const avg = [0, 1, 2].map(i => Math.round(pts.reduce((s, p) => s + p[i], 0) / 4));
      const spread = Math.max(...pts.map(p => Math.abs(p[0] - avg[0]) + Math.abs(p[1] - avg[1]) + Math.abs(p[2] - avg[2])));
      if (spread > 40) return null;
      return '#' + avg.map(v => v.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }
  let rawCanvas = null;
  async function setArt(src, { bg = null, name = '', data = null, isPhoto = false } = {}) {
    try {
      const im = await loadImage(src);
      rawCanvas = toCanvas(im);
      S.knock = false; $('#knockBtn').setAttribute('aria-pressed', 'false');
      S.img = rawCanvas; S.rot = 0; S.ox = 0; S.oy = 0;
      const cc = cornerColor(rawCanvas);
      if (bg) setBg(bg); else if (cc) setBg(cc);
      if (isPhoto && !cc) fill(); else { S.scale = 1; syncSliders(); }
      S.fileName = name; S.fileData = data;
      draw();
    } catch (e) { alert('Sorry, that image could not be opened. Try a PNG or JPG.'); }
  }
  function fill() {
    if (!S.img) return;
    const mx = Math.max(S.img.width, S.img.height), mn = Math.min(S.img.width, S.img.height);
    S.scale = Math.min(2.5, (mx / mn) / .78 * 1.01); S.ox = S.oy = 0; syncSliders(); draw();
  }

  /* ---------- controls wiring ---------- */
  function syncSliders() {
    $('#scale').value = Math.round(S.scale * 100); $('#scaleOut').textContent = Math.round(S.scale * 100) + '%';
    $('#rotate').value = S.rot; $('#rotOut').textContent = S.rot + '°';
  }
  function setBg(c) {
    S.bg = c;
    $$('#bgSwatches button').forEach(b => b.classList.toggle('on', b.dataset.c.toLowerCase() === c.toLowerCase()));
    const custom = $('#bgSwatches .custom');
    const matched = $$('#bgSwatches button').some(b => b.classList.contains('on'));
    custom.classList.toggle('on', !matched);
    if (!matched) $('#bgCustom').value = c.length === 7 ? c : '#000000';
    // auto text color contrast if user hasn't picked one
    if (!textColorTouched) { S.textColor = lum(c) > .6 ? '#111111' : '#ffffff'; $('#textColor').value = S.textColor; }
  }
  let textColorTouched = false;

  function setProduct(p) {
    S.product = p;
    const P = PRODUCTS[p];
    if (!P.sizes.includes(S.size)) S.size = P.def;
    $('#sizeChips').innerHTML = P.sizes.map(s =>
      `<label><input type="radio" name="size" value="${s}" ${s === S.size ? 'checked' : ''}><span>${s}″</span></label>`).join('');
    $('#shapeCtrl').style.display = P.shapes ? '' : 'none';
    if (!P.shapes) S.shape = 'round';
    $('#hardwareGroup').classList.toggle('hidden', !P.hang);
    $('#nfcGroup').classList.toggle('hidden', !P.nfc);
    if (p === 'mirror' && S.tassel === 'none' && !tasselTouched) setTassel('#ff4fa3');
    // renumber visible steps
    let n = 0; $$('.panel .group').forEach(f => { if (!f.classList.contains('hidden')) { n++; f.querySelector('legend b').textContent = String(n).padStart(2, '0'); } });
    const radio = $(`input[name=product][value="${p}"]`); if (radio) radio.checked = true;
    draw();
  }
  let tasselTouched = false;
  function setTassel(c) {
    S.tassel = c; $$('#tasselSwatches button').forEach(b => b.classList.toggle('on', b.dataset.c === c));
  }

  $('#productGrid').addEventListener('change', e => { if (e.target.name === 'product') setProduct(e.target.value); });
  $('#studioForm').addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'size') { S.size = parseFloat(t.value); draw(); }
    if (t.name === 'shape') { S.shape = t.value; draw(); }
    if (t.name === 'finish') { S.finish = t.value; draw(); }
    if (t.name === 'metal') { S.metal = t.value; draw(); }
    if (t.name === 'pack') { S.pack = t.value; draw(); }
    if (t.name === 'qpick') { S.qty = parseInt(t.value, 10); $('#qty').value = S.qty; renderSummary(); }
    if (t.id === 'nfcIcon') { S.nfcIcon = t.checked; draw(); }
    if (t.id === 'textFont') { S.font = t.value; draw(); }
    if (t.id === 'textPos') { S.textPos = t.value; draw(); }
    if (t.id === 'needBy') { S.needBy = t.value; renderSummary(); }
  });
  $('#textLine').addEventListener('input', e => { S.text = e.target.value; draw(); });
  $('#textColor').addEventListener('input', e => { textColorTouched = true; S.textColor = e.target.value; draw(); });
  $('#nfcUrl').addEventListener('input', e => { S.nfcUrl = e.target.value.trim(); renderSummary(); });
  $('#qty').addEventListener('input', e => {
    S.qty = Math.max(1, parseInt(e.target.value || '1', 10));
    $$('input[name=qpick]').forEach(r => r.checked = parseInt(r.value, 10) === S.qty);
    renderSummary();
  });
  $('#scale').addEventListener('input', e => { S.scale = e.target.value / 100; $('#scaleOut').textContent = e.target.value + '%'; draw(); });
  $('#rotate').addEventListener('input', e => { S.rot = parseInt(e.target.value, 10); $('#rotOut').textContent = S.rot + '°'; draw(); });
  $('#fitBtn').addEventListener('click', () => { S.scale = 1; S.ox = S.oy = 0; syncSliders(); draw(); });
  $('#fillBtn').addEventListener('click', fill);
  $('#centerBtn').addEventListener('click', () => { S.ox = S.oy = 0; draw(); });
  $('#knockBtn').addEventListener('click', e => {
    if (!rawCanvas) return;
    S.knock = !S.knock; e.currentTarget.setAttribute('aria-pressed', S.knock);
    S.img = S.knock ? knockWhite(rawCanvas) : rawCanvas; draw();
  });
  $('#bgSwatches').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setBg(b.dataset.c); draw(); } });
  $('#bgCustom').addEventListener('input', e => { setBg(e.target.value); draw(); });
  $('#tasselSwatches').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tasselTouched = true; setTassel(b.dataset.c); draw(); } });
  $$('[data-side]').forEach(b => b.addEventListener('click', () => {
    S.side = b.dataset.side; $$('[data-side]').forEach(x => x.classList.toggle('on', x === b)); draw();
  }));
  $$('[data-scene]').forEach(b => b.addEventListener('click', () => {
    S.scene = b.dataset.scene; $$('[data-scene]').forEach(x => x.classList.toggle('on', x === b)); draw();
  }));
  $$('[data-sample]').forEach(b => b.addEventListener('click', () => {
    setArt(b.dataset.sample, { bg: b.dataset.bg, name: '', isPhoto: b.dataset.sample.endsWith('.jpg') });
    $('#drop').classList.remove('has-file'); $('#drop strong').textContent = 'Drop your logo here';
  }));

  // file upload + drag & drop
  const drop = $('#drop');
  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) { alert('Please choose an image file (PNG, JPG, WEBP or SVG).'); return; }
    if (file.size > 15 * 1024 * 1024) { alert('That file is over 15 MB. Please use a smaller version.'); return; }
    const fr = new FileReader();
    fr.onload = () => {
      drop.classList.add('has-file'); $('#drop strong').textContent = file.name;
      setArt(fr.result, { name: file.name, data: file.size < 2 * 1024 * 1024 ? fr.result : null, isPhoto: /jpe?g|webp/.test(file.type) });
    };
    fr.readAsDataURL(file);
  }
  $('#fileInput').addEventListener('change', e => handleFile(e.target.files[0]));
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));
  // also allow dropping straight onto the preview
  const stage = $('#stage');
  stage.addEventListener('dragover', e => e.preventDefault());
  stage.addEventListener('drop', e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

  // drag-to-position + wheel zoom on the canvas
  let drag = null;
  const toLocal = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * W / r.height }; };
  canvas.addEventListener('pointerdown', e => {
    if (!S.img || S.side !== 'front') return;
    drag = { p: toLocal(e), ox: S.ox, oy: S.oy }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
    $('#stageHint').style.opacity = 0;
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = toLocal(e), r = geometry().r;
    S.ox = drag.ox + (p.x - drag.p.x) / r; S.oy = drag.oy + (p.y - drag.p.y) / r; draw();
  });
  const end = () => { drag = null; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', e => {
    if (!S.img) return; e.preventDefault();
    S.scale = Math.min(2.5, Math.max(.2, S.scale * (1 - e.deltaY * .0012))); syncSliders(); draw();
  }, { passive: false });

  /* ---------- summary + export ---------- */
  function summaryData() {
    const P = PRODUCTS[S.product];
    const rows = [
      ['Product', P.label],
      ['Size', `${S.size}″ (${Math.round(S.size * 25.4)} mm)${P.shapes ? ' · ' + S.shape : ''}`],
      ['Finish', S.finish === 'gloss' ? 'Glossy' : 'Matte'],
    ];
    if (P.hang) rows.push(['Hardware', `${S.metal[0].toUpperCase() + S.metal.slice(1)} ring & chain` + (S.tassel !== 'none' ? ` · ${S.tassel} tassel` : '')]);
    if (P.nfc) rows.push(['Tap link', S.nfcUrl || 'Not set yet']);
    if (S.text.trim()) rows.push(['Text', `“${S.text}”`]);
    rows.push(['Background', S.bg]);
    rows.push(['Packaging', { none: 'Loose', sleeve: 'Clear sleeve', card: 'Sleeve + custom backer card' }[S.pack]]);
    rows.push(['Quantity', String(S.qty)]);
    if (S.needBy) rows.push(['Need by', new Date(S.needBy + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })]);
    rows.push(['Artwork', S.fileName || (S.img ? 'Sample artwork' : 'None yet')]);
    return rows;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function renderSummary() {
    $('#summary').innerHTML = `<h4>Your build</h4><dl>${summaryData().map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  }
  function snapshot(side) {
    const prev = S.side; S.side = side; draw();
    const url = canvas.toDataURL('image/jpeg', .86);
    S.side = prev; draw(); return url;
  }
  function download() {
    const a = document.createElement('a');
    a.download = `neeksxart-${S.product}-mockup.png`; a.href = canvas.toDataURL('image/png'); a.click();
  }
  $('#downloadBtn').addEventListener('click', download);
  $('#downloadBtn2').addEventListener('click', download);
  $('#quoteBtn').addEventListener('click', () => {
    const payload = {
      product: S.product, summary: summaryData(), mockup: snapshot('front'),
      fileName: S.fileName, logo: S.fileData, qty: S.qty, needBy: S.needBy
    };
    try { sessionStorage.setItem('neeksMockup', JSON.stringify(payload)); }
    catch (e) {
      try { payload.logo = null; sessionStorage.setItem('neeksMockup', JSON.stringify(payload)); } catch (e2) { /* storage unavailable */ }
    }
    location.href = '/contact?from=studio';
  });

  /* ---------- init ---------- */
  const qp = new URLSearchParams(location.search).get('product');
  const start = PRODUCTS[qp] ? qp : 'keychain';
  const fontsReady = document.fonts ? Promise.all([
    document.fonts.load('40px Yellowtail'), document.fonts.load('40px Anton'), document.fonts.load('800 40px Manrope')
  ]).catch(() => {}) : Promise.resolve();
  setProduct(start);
  setArt('/assets/img/logo-white.png', { bg: '#0b0b0b' });
  fontsReady.then(draw);
})();

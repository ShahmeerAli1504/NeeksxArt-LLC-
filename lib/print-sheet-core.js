// Print-sheet PDF engine shared by the server (/api/admin/print-sheet) and the browser
// (dashboard → Templates → Sheet maker). No Node or browser APIs in here: callers pass in
// ready images and a `deflate` function (zlib on the server, CompressionStream in the browser).
//
// Geometry = the NeeksxArt press templates (scripts/build-print-templates.py), US Letter, exact size.
//   kind 'round'  → 2.25" keychain/button, 12 per sheet, photo in the 2.25" window under the NeeksxArt rim
//   kind 'magnet' → 2.5" square magnet, 6 per sheet, art square 2.54" inside the 3.333" octagon
//
// Images: { kind: 'jpeg', data: Uint8Array, w, h, comps } (embedded as-is)
//      or { kind: 'raw', rgb: Uint8Array, alpha: Uint8Array|null, w, h }

const IN = 72;
export const PAGE_W = 8.5 * IN, PAGE_H = 11 * IN;

export const SHEETS = {
  round: {
    perSheet: 12, cols: 3, rows: 4,
    cut: 2.625 * IN, face: 2.25 * IN, safe: 1.875 * IN, bleed: 0.02 * IN, // photo window = face; rim covers face→cut
    cellW: 8.3125 * IN / 3, cellH: 11 * IN / 4,
    name: '2.25" round keychain / button',
    pxPerInch: 300
  },
  magnet: {
    perSheet: 6, cols: 2, rows: 3,
    cut: 10 / 3 * IN, chamfer: 0.7723 * IN, art: 2.54 * IN, face: 2.5 * IN, safe: 2.25 * IN,
    marginX: (8.5 * IN - 2 * (10 / 3 * IN) - 0.5 * IN) / 2, gapX: 0.5 * IN,
    marginY: IN / 6, gapY: (11 * IN - 3 * (10 / 3 * IN) - 2 * (IN / 6)) / 2,
    name: '2.5" square magnet',
    pxPerInch: 300
  }
};

/** which press template a pop-up item goes on — same rule the order page uses for round vs square */
export const pieceKind = (item, shape) => (shape === 'round' || (item && item !== 'magnet')) ? 'round' : 'magnet';

/** the area a photo fills, in inches (used by the browser to crop at print resolution) */
export const photoWindowInches = (kind, withRing = true) =>
  kind === 'magnet' ? SHEETS.magnet.art / IN : (withRing ? (SHEETS.round.face + 2 * SHEETS.round.bleed) : SHEETS.round.cut) / IN;

/* ---------------- bytes ---------------- */
const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
const concat = list => {
  const out = new Uint8Array(list.reduce((n, a) => n + a.length, 0));
  let o = 0; for (const a of list) { out.set(a, o); o += a.length; }
  return out;
};

/* ---------------- text (Helvetica-Bold, built into every PDF reader) ---------------- */
const HB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const latin1 = s => String(s ?? '').normalize('NFC').replace(/[^\x20-\x7e\xa0-\xff]/g, '?');
const textWidth = (s, size) => [...latin1(s)].reduce((w, ch) => w + (HB[ch.charCodeAt(0) - 32] ?? 556), 0) * size / 1000;
const pdfStr = s => '(' + latin1(s).replace(/[\\()]/g, m => '\\' + m) + ')';
const f = v => (Math.round(v * 1000) / 1000).toString();

function textAt(s, size, x, y, deg = 0, gray = 0) {
  const X = x, Y = PAGE_H - y;
  const m = deg === -90 ? [0, 1, -1, 0, X, Y] : [1, 0, 0, 1, X, Y];
  return `BT ${f(gray)} g /F1 ${f(size)} Tf ${m.map(f).join(' ')} Tm ${pdfStr(s)} Tj ET\n`;
}

/* ---------------- shapes (top-left coords in, PDF coords out) ---------------- */
const K = 0.5523;
function circlePath(cx, cy, r) {
  const X = cx, Y = PAGE_H - cy, k = r * K;
  return `${f(X + r)} ${f(Y)} m ${f(X + r)} ${f(Y + k)} ${f(X + k)} ${f(Y + r)} ${f(X)} ${f(Y + r)} c ` +
    `${f(X - k)} ${f(Y + r)} ${f(X - r)} ${f(Y + k)} ${f(X - r)} ${f(Y)} c ` +
    `${f(X - r)} ${f(Y - k)} ${f(X - k)} ${f(Y - r)} ${f(X)} ${f(Y - r)} c ` +
    `${f(X + k)} ${f(Y - r)} ${f(X + r)} ${f(Y - k)} ${f(X + r)} ${f(Y)} c h `;
}
const rectPath = (x, y, w, h) => `${f(x)} ${f(PAGE_H - y - h)} ${f(w)} ${f(h)} re `;
function octagonPath(x, y, s, k) {
  const p = [[x + k, y], [x + s - k, y], [x + s, y + k], [x + s, y + s - k], [x + s - k, y + s], [x + k, y + s], [x, y + s - k], [x, y + k]];
  return p.map(([a, b], i) => `${f(a)} ${f(PAGE_H - b)} ${i ? 'l' : 'm'}`).join(' ') + ' h ';
}
const line = (x1, y1, x2, y2) => `${f(x1)} ${f(PAGE_H - y1)} m ${f(x2)} ${f(PAGE_H - y2)} l `;

function placeImage(name, img, bx, by, bw, bh, mode) {
  const a = img.w / img.h;
  let w, h;
  if (mode === 'cover') { if (a > bw / bh) { h = bh; w = bh * a; } else { w = bw; h = bw / a; } }
  else { if (a > bw / bh) { w = bw; h = bw / a; } else { h = bh; w = bh * a; } }
  const x = bx + (bw - w) / 2, y = by + (bh - h) / 2;
  return `q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(PAGE_H - y - h)} cm /${name} Do Q\n`;
}

/** width/height/components of a JPEG, or null */
export function jpegInfo(b) {
  if (!(b[0] === 0xff && b[1] === 0xd8)) return null;
  const u16 = o => (b[o] << 8) | b[o + 1];
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) { o++; continue; }
    const m = b[o + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7) || m === 0xff) { o += m === 0xff ? 1 : 2; continue; }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: u16(o + 5), w: u16(o + 7), comps: b[o + 9] };
    o += 2 + u16(o + 2);
  }
  return null;
}

/* ---------------- PDF writer ---------------- */
class Pdf {
  constructor() { this.objs = []; }
  add(dict, stream) { this.objs.push({ dict, stream }); return this.objs.length; }
  reserve() { this.objs.push(null); return this.objs.length; }
  set(id, dict, stream) { this.objs[id - 1] = { dict, stream }; }
  bytes() {
    const parts = [enc('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')];
    let len = parts[0].length;
    const offsets = [];
    this.objs.forEach((o, i) => {
      offsets.push(len);
      const chunk = [enc(`${i + 1} 0 obj\n${o.dict}${o.stream ? '\nstream\n' : '\n'}`)];
      if (o.stream) chunk.push(o.stream);
      chunk.push(enc(o.stream ? '\nendstream\nendobj\n' : 'endobj\n'));
      chunk.forEach(c => { parts.push(c); len += c.length; });
    });
    const xref = `xref\n0 ${this.objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
    parts.push(enc(`${xref}trailer\n<< /Size ${this.objs.length + 1} /Root 1 0 R /Info ${this.info} 0 R >>\nstartxref\n${len}\n%%EOF\n`));
    return concat(parts);
  }
}

async function embedImage(pdf, img, deflate) {
  if (img.kind === 'jpeg') {
    return pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /${img.comps === 1 ? 'DeviceGray' : 'DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>`, img.data);
  }
  let smask = '';
  if (img.alpha) {
    const a = await deflate(img.alpha);
    const id = pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${a.length} >>`, a);
    smask = ` /SMask ${id} 0 R`;
  }
  const c = await deflate(img.rgb);
  return pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode${smask} /Length ${c.length} >>`, c);
}

/* ---------------- sheets ---------------- */
function roundSlots() {
  const S = SHEETS.round;
  return Array.from({ length: S.perSheet }, (_, i) => {
    const c = i % S.cols, r = Math.floor(i / S.cols);
    return { cx: (c + .5) * S.cellW, cy: (r + .5) * S.cellH, cellX: c * S.cellW, cellY: r * S.cellH };
  });
}
function magnetSlots() {
  const S = SHEETS.magnet;
  return Array.from({ length: S.perSheet }, (_, i) => {
    const c = i % S.cols, r = Math.floor(i / S.cols);
    const x = S.marginX + c * (S.cut + S.gapX), y = S.marginY + r * (S.cut + S.gapY);
    return { x, y, cx: x + S.cut / 2, cy: y + S.cut / 2 };
  });
}

function drawRoundPage(pieces, fit, footer, ring) {
  const S = SHEETS.round;
  let out = 'q 0.71 G 0.5 w ';
  for (let c = 1; c <= S.cols; c++) out += line(c * S.cellW, 0, c * S.cellW, PAGE_H);
  for (let r = 1; r < S.rows; r++) out += line(0, r * S.cellH, S.cols * S.cellW, r * S.cellH);
  out += 'S Q\n';
  roundSlots().forEach((s, i) => {
    const p = pieces[i];
    if (p) {
      if (fit === 'photo') {
        const d = ring ? S.face + 2 * S.bleed : S.cut;
        out += `q ${circlePath(s.cx, s.cy, d / 2)}W n\n` + placeImage(p.name, p.img, s.cx - d / 2, s.cy - d / 2, d, d, 'cover') + 'Q\n';
      } else {
        const a = p.img.w / p.img.h, d = S.safe, bw = d * a / Math.hypot(a, 1), bh = d / Math.hypot(a, 1);
        out += placeImage(p.name, p.img, s.cx - bw / 2, s.cy - bh / 2, bw, bh, 'contain');
      }
      if (p.label) out += textAt(p.label, 7, s.cellX + 5, s.cellY + 11, 0, 0.35);
    }
    if (ring) out += placeImage('Ring', ring, s.cx - S.cut / 2, s.cy - S.cut / 2, S.cut, S.cut, 'contain');
    else out += `q 0 G 0.5 w ${circlePath(s.cx, s.cy, S.cut / 2)}S Q\n`;
  });
  const sx = S.cols * S.cellW + (PAGE_W - S.cols * S.cellW) / 2;
  out += textAt(footer, 5.6, sx + 2.2, PAGE_H - 12, -90, 0.2);
  return out;
}

// Flap text — matches Template/2.5_ S MAGS latest.png: Helvetica Bold 8 pt, hugging the art square.
const FLAP_FS = 8, FLAP_ASC = 0.718 * FLAP_FS, FLAP_DESC = 0.207 * FLAP_FS, FLAP_TOP_GAP = 0.017 * IN;
const FLAP_RIGHT_EXTRA = 0.014 * IN, FLAP_BOTTOM_SHIFT = 0.057 * IN; // as placed on the latest template
function flapLine(s, cx, cy, side) {
  const a = SHEETS.magnet.art / 2, w = textWidth(s, FLAP_FS), X = cx, Y = PAGE_H - cy;
  let m;
  if (side === 'top') m = [-1, 0, 0, -1, X + w / 2, PAGE_H - (cy - a - FLAP_TOP_GAP - FLAP_ASC)];   // upside down, letter tops toward the art
  else if (side === 'bottom') m = [-1, 0, 0, -1, X + FLAP_BOTTOM_SHIFT + w / 2, PAGE_H - (cy + a + FLAP_DESC)];        // upside down, baseline toward the art
  else if (side === 'left') m = [0, 1, -1, 0, cx - a - FLAP_DESC, Y - w / 2];                       // reads bottom → top
  else m = [0, -1, 1, 0, cx + a + FLAP_DESC + FLAP_RIGHT_EXTRA, Y + w / 2];                                           // reads top → bottom
  return `BT 0 g /F1 ${f(FLAP_FS)} Tf ${m.map(f).join(' ')} Tm ${pdfStr(s)} Tj ET\n`;
}

function drawMagnetPage(pieces, fit, footer, flaps) {
  const S = SHEETS.magnet;
  let out = '';
  magnetSlots().forEach((s, i) => {
    const p = pieces[i];
    if (p) {
      if (fit === 'photo') {
        out += `q ${rectPath(s.cx - S.art / 2, s.cy - S.art / 2, S.art, S.art)}W n\n` + placeImage(p.name, p.img, s.cx - S.art / 2, s.cy - S.art / 2, S.art, S.art, 'cover') + 'Q\n';
      } else {
        out += placeImage(p.name, p.img, s.cx - S.safe / 2, s.cy - S.safe / 2, S.safe, S.safe, 'contain');
      }
      if (p.label) out += textAt(p.label, 7, s.x + 4, s.y + 11, 0, 0.35);
    }
    if (flaps) {
      out += flapLine('Custom Merch by @neeksxart', s.cx, s.cy, 'top');
      out += flapLine('neeksxart.com', s.cx, s.cy, 'bottom');
      out += flapLine('Instagram: @neeksxart', s.cx, s.cy, 'left');
      out += flapLine('info@neeksxart.com', s.cx, s.cy, 'right');
    }
    out += `q 0 G 0.75 w ${octagonPath(s.x, s.y, S.cut, S.chamfer)}S Q\n`;
  });
  out += textAt(footer, 5.6, S.marginX / 2 + 2, PAGE_H - IN / 4, -90, 0.2);
  return out;
}

/**
 * pieces: [{ img, kind: 'magnet'|'round', label?, key? }] — `img` already prepared (see top);
 *   pieces sharing a `key` share one embedded image.
 * ring:   prepared keychain rim image (raw RGBA) or null for a plain cut line.
 * deflate: async (Uint8Array) => Uint8Array  (zlib format)
 * Returns the PDF as Uint8Array. Magnet sheets first, then round sheets.
 */
export async function renderPrintPdf({ pieces, fit = 'photo', title = '', ring = null, deflate, flaps = true }) {
  const pdf = new Pdf();
  const catalog = pdf.reserve(), pagesId = pdf.reserve();
  const font = pdf.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  const cache = new Map(), ready = [];
  for (const [i, p] of pieces.entries()) {
    const key = p.key || `img${i}`;
    if (!cache.has(key)) cache.set(key, { name: `Im${cache.size + 1}`, img: p.img, id: await embedImage(pdf, p.img, deflate) });
    const e = cache.get(key);
    ready.push({ ...p, name: e.name, img: e.img });
  }

  const pages = [];
  for (const kind of ['magnet', 'round']) {
    const list = ready.filter(p => p.kind === kind);
    const per = SHEETS[kind].perSheet, total = Math.ceil(list.length / per);
    for (let s = 0; s < total; s++) pages.push({ kind, list: list.slice(s * per, (s + 1) * per), n: s + 1, total });
  }

  let xobjects = [...cache.values()].map(e => `/${e.name} ${e.id} 0 R`).join(' ');
  const useRing = ring && pages.some(pg => pg.kind === 'round');
  if (useRing) xobjects += ` /Ring ${await embedImage(pdf, ring, deflate)} 0 R`;

  const kids = [];
  for (const pg of pages) {
    const footer = `${title ? title + '  ·  ' : ''}${SHEETS[pg.kind].name}  ·  sheet ${pg.n} of ${pg.total}  ·  Letter 8.5 x 11 in  ·  Print at 100% / Actual size`;
    const content = pg.kind === 'round' ? drawRoundPage(pg.list, fit, footer, useRing ? ring : null) : drawMagnetPage(pg.list, fit, footer, flaps);
    const z = await deflate(enc(content));
    const cid = pdf.add(`<< /Length ${z.length} /Filter /FlateDecode >>`, z);
    kids.push(pdf.add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${cid} 0 R ` +
      `/Resources << /Font << /F1 ${font} 0 R >> /XObject << ${xobjects} >> >> >>`));
  }
  pdf.set(pagesId, `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pdf.info = pdf.add(`<< /Title ${pdfStr(title || 'NeeksxArt print sheet')} /Producer (NeeksxArt dashboard) >>`);
  return pdf.bytes();
}

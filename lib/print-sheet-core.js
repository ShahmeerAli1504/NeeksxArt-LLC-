// Print-sheet PDF engine shared by the server (/api/admin/print-sheet) and the browser
// (dashboard → Templates → Sheet maker). No Node or browser APIs in here: callers pass in
// ready images and a `deflate` function (zlib on the server, CompressionStream in the browser).
//
// Every sheet is the client's OWN press template (Template/*Latest*.png), used as-is:
//   1. the blank template fills the Letter page (rims, flap text, grid lines, MPRO strip — untouched)
//   2. each photo is drawn on top, clipped exactly to its window (positions measured from the
//      template → lib/print-frames.js). No transparency or masks: prints the same on every printer.
//   3. unused spots are blanked so they don't waste ink
//   4. an optional label (order number, name, "sheet 1 of 2") in a blank margin, outside every cut line,
//      so sheets can't get mixed up on a busy day. Nothing else is added to the template.
//
// Images: { kind: 'jpeg', data: Uint8Array, w, h, comps } (embedded as-is)
//      or { kind: 'raw', rgb: Uint8Array, alpha?: Uint8Array|null, w, h }
import { FRAMES } from './print-frames.js';

const IN = 72;
export const PAGE_W = 8.5 * IN, PAGE_H = 11 * IN;

const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const ROUND_WINDOW = 2 * avg(FRAMES.round.slots.map(s => s.r));      // ≈ 2.251" photo window inside the rim
const MAGNET_ART = avg(FRAMES.magnet.slots.map(s => s.w));             // ≈ 2.548" photo square

export const SHEETS = {
  round: {
    perSheet: FRAMES.round.slots.length, name: '2.25" round keychain / button',
    window: ROUND_WINDOW, safe: 1.875 * IN,
    edge: 0.3                   // photo overlaps the rim's inner edge by 0.3 pt (0.004") so no hairline shows
  },
  magnet: {
    perSheet: FRAMES.magnet.slots.length, name: '2.5" square magnet',
    art: MAGNET_ART, safe: 2.25 * IN,
    edge: 0.15                  // fills the square exactly (+0.002" to hide the anti-aliased edge)
  }
};
export { FRAMES };

/** which press template a pop-up item goes on — same rule the order page uses for round vs square */
export const pieceKind = (item, shape) => (shape === 'round' || (item && item !== 'magnet')) ? 'round' : 'magnet';

/** size of the area a photo fills, in inches (the browser crops photos to this at print resolution) */
export const photoWindowInches = kind => (kind === 'magnet' ? MAGNET_ART : ROUND_WINDOW) / IN;

/** template image file for a sheet kind */
export const frameFile = (kind, flaps = true) =>
  kind === 'magnet' ? (flaps ? FRAMES.magnet.file : FRAMES.magnet.fileBlank) : FRAMES.round.file;

/* ---------------- bytes ---------------- */
const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
const concat = list => {
  const out = new Uint8Array(list.reduce((n, a) => n + a.length, 0));
  let o = 0; for (const a of list) { out.set(a, o); o += a.length; }
  return out;
};
const latin1 = s => String(s ?? '').normalize('NFC').replace(/[^\x20-\x7e\xa0-\xff]/g, '?');
const pdfStr = s => '(' + latin1(s).replace(/[\\()]/g, m => '\\' + m) + ')';
const f = v => (Math.round(v * 1000) / 1000).toString();

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

/** draw image `name` (w×h px) into the box: cover = fill & crop, contain = fit inside */
function placeImage(name, img, bx, by, bw, bh, mode) {
  const a = img.w / img.h;
  let w, h;
  if (mode === 'cover') { if (a > bw / bh) { h = bh; w = bh * a; } else { w = bw; h = bw / a; } }
  else { if (a > bw / bh) { w = bw; h = bw / a; } else { h = bh; w = bh * a; } }
  const x = bx + (bw - w) / 2, y = by + (bh - h) / 2;
  return `q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(PAGE_H - y - h)} cm /${name} Do Q\n`;
}
const fullPage = name => `q ${f(PAGE_W)} 0 0 ${f(PAGE_H)} 0 0 cm /${name} Do Q\n`;

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

/** RGB(A) pixels (e.g. a decoded template PNG) → image for the PDF */
export function frameFromPixels(data, w, h, channels) {
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < w * h; i++, j += channels) { rgb[i * 3] = data[j]; rgb[i * 3 + 1] = data[j + 1]; rgb[i * 3 + 2] = data[j + 2]; }
  return { kind: 'raw', rgb, alpha: null, w, h };
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
  let mask = '';
  if (img.alpha) {
    const a = await deflate(img.alpha);
    const id = pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${a.length} >>`, a);
    mask = ` /SMask ${id} 0 R`;
  }
  const c = await deflate(img.rgb);
  return pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode${mask} /Length ${c.length} >>`, c);
}

/* ---------------- label (Helvetica-Bold, one of the 14 built-in PDF fonts: nothing to embed) ---------------- */
const charW = c => /[A-Z]/.test(c) ? 0.72 : /[0-9a-z]/.test(c) ? 0.58 : c === ' ' ? 0.28 : 0.5;   // ≈ Helvetica-Bold, rounded up
const textWidth = (s, size) => [...latin1(s)].reduce((a, c) => a + charW(c), 0) * size;
const fitSize = (s, size, maxW, min = 4.5) => Math.max(min, Math.min(size, maxW / Math.max(1, textWidth(s, 1))));
const clip = (s, size, maxW) => { let t = latin1(s); while (t.length > 3 && textWidth(t, size) > maxW) t = t.slice(0, -2) + '.'; return t; };

/** horizontal text, right-aligned at x (top-left coords; y = baseline) */
function textRight(s, size, x, y, maxW) {
  const sz = fitSize(s, size, maxW), t = clip(s, sz, maxW);
  return `BT /Lbl ${f(sz)} Tf 0 g 1 0 0 1 ${f(x - textWidth(t, sz))} ${f(PAGE_H - y)} Tm ${pdfStr(t)} Tj ET\n`;
}
/** text rotated 90° (reads bottom to top), centred on (cx, cy) */
function textUp(s, size, cx, cy, maxLen) {
  const sz = fitSize(s, size, maxLen), t = clip(s, sz, maxLen), w = textWidth(t, sz);
  return `BT /Lbl ${f(sz)} Tf 0 g 0 1 -1 0 ${f(cx + sz * 0.35)} ${f(PAGE_H - cy - w / 2)} Tm ${pdfStr(t)} Tj ET\n`;
}

/**
 * label = { main: 'NX-649W', sub: 'Zoheb · The Trio' }; `sheet` = "Sheet 1 of 2" when an order needs several.
 * Round (12-up): the right edge, in the gap where rows 1 and 2 meet: clear of the rims, the cut line and MPRO's strip.
 * Magnet (6-up): the empty right margin, running up the page.
 */
function drawLabel(kind, label, sheet) {
  if (!label || !(label.main || label.sub)) return '';
  if (kind === 'round') {
    // above the cut line: order number · below it: name/pack, then the sheet count (all clear of the rims at x ≥ 545)
    return (label.main ? textRight(label.main, 7.5, 595, 194.5, 50) : '') +
      (label.sub ? textRight(label.sub, 5.5, 595, 206.5, 48) : '') +
      (sheet ? textRight(sheet, 5.5, 595, 213, 44) : '');
  }
  const line = [label.main, label.sub, sheet].filter(Boolean).join('  ·  ');
  return textUp(line, 10, 588, PAGE_H / 2, 520);
}

/* ---------------- sheets ---------------- */
function drawRoundPage(pieces, fit) {
  const S = SHEETS.round;
  let out = fullPage('Frame');                       // the client's template, exactly
  FRAMES.round.slots.forEach((s, i) => {
    const p = pieces[i];
    if (!p) { out += `q 1 g ${circlePath(s.cx, s.cy, s.cutR + 3)}f Q\n`; return; }   // unused spot: blank (stays inside the cell)
    if (fit === 'photo') {
      const r = s.r + S.edge;
      out += `q ${circlePath(s.cx, s.cy, r)}W n\n` + placeImage(p.name, p.img, s.cx - r, s.cy - r, 2 * r, 2 * r, 'cover') + 'Q\n';
    } else {
      // logo: largest box (same shape as the logo) that fits inside the safe circle
      const a = p.img.w / p.img.h, d = S.safe, bw = d * a / Math.hypot(a, 1), bh = d / Math.hypot(a, 1);
      out += placeImage(p.name, p.img, s.cx - bw / 2, s.cy - bh / 2, bw, bh, 'contain');
    }
  });
  return out;
}

function drawMagnetPage(pieces, fit) {
  const S = SHEETS.magnet;
  let out = fullPage('Frame');
  FRAMES.magnet.slots.forEach((s, i) => {
    const p = pieces[i];
    if (!p) { out += `q 1 g ${rectPath(s.ox - 3, s.oy - 3, s.ow + 6, s.oh + 6)}f Q\n`; return; }
    if (fit === 'photo') {
      const e = S.edge;
      out += `q ${rectPath(s.x - e, s.y - e, s.w + 2 * e, s.h + 2 * e)}W n\n` + placeImage(p.name, p.img, s.x - e, s.y - e, s.w + 2 * e, s.h + 2 * e, 'cover') + 'Q\n';
    } else {
      const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      out += placeImage(p.name, p.img, cx - S.safe / 2, cy - S.safe / 2, S.safe, S.safe, 'contain');
    }
  });
  return out;
}

/**
 * pieces:  [{ img, kind: 'magnet'|'round', key? }] — `img` already prepared (see top);
 *          pieces sharing a `key` share one embedded image.
 * frames:  { round?, magnet? } — the template images (frameFromPixels), required for each kind used.
 * deflate: async (Uint8Array) => Uint8Array  (zlib format)
 * label:   optional { main, sub } printed in a blank margin of every sheet (see drawLabel)
 * Returns the PDF as Uint8Array. Magnet sheets first, then round sheets.
 */
export async function renderPrintPdf({ pieces, fit = 'photo', title = '', frames = {}, deflate, label = null }) {
  const pdf = new Pdf();
  const catalog = pdf.reserve(), pagesId = pdf.reserve();

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
    if (!list.length) continue;
    if (!frames[kind]) throw new Error(`The ${SHEETS[kind].name} template image is missing`);
    const per = SHEETS[kind].perSheet;
    for (let s = 0; s * per < list.length; s++) pages.push({ kind, list: list.slice(s * per, (s + 1) * per) });
  }

  const frameIds = {};
  for (const kind of new Set(pages.map(p => p.kind))) frameIds[kind] = await embedImage(pdf, frames[kind], deflate);
  const photoObjs = [...cache.values()].map(e => `/${e.name} ${e.id} 0 R`).join(' ');

  const font = label ? pdf.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>') : 0;
  const kids = [];
  for (const [n, pg] of pages.entries()) {
    const sheet = pages.length > 1 ? `Sheet ${n + 1} of ${pages.length}` : '';
    const content = (pg.kind === 'round' ? drawRoundPage(pg.list, fit) : drawMagnetPage(pg.list, fit)) + drawLabel(pg.kind, label, sheet);
    const z = await deflate(enc(content));
    const cid = pdf.add(`<< /Length ${z.length} /Filter /FlateDecode >>`, z);
    kids.push(pdf.add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${cid} 0 R ` +
      `/Resources << /XObject << ${photoObjs} /Frame ${frameIds[pg.kind]} 0 R >>${font ? ` /Font << /Lbl ${font} 0 R >>` : ''} >> >>`));
  }
  pdf.set(pagesId, `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pdf.info = pdf.add(`<< /Title ${pdfStr(title || 'NeeksxArt print sheet')} /Producer (NeeksxArt dashboard) >>`);
  return pdf.bytes();
}

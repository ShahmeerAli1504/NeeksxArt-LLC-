import 'server-only';
// Builds print-ready PDF sheets (US Letter, exact size) with customer images placed on the
// NeeksxArt press templates — same geometry as /print-templates (scripts/build-print-templates.py).
//
//   buildPrintSheet({ pieces: [{ image, label, kind }], fit, title })  →  Buffer (PDF)
//     kind:  'magnet' (2.5" square, 6 per sheet) | 'round' (2.25" keychain/button, 12 per sheet)
//     fit:   'photo' → fills the whole piece edge to edge (pop-up photos are already cropped square)
//            'logo'  → whole logo fits inside the safe area on white
//
// JPEG photos are embedded as-is (no re-compression). Other formats (PNG, WebP, SVG, GIF) go
// through sharp, which ships with Next.js.
import { deflateSync, inflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const IN = 72;
const PAGE_W = 8.5 * IN, PAGE_H = 11 * IN;

export const SHEETS = {
  round: {
    perSheet: 12, cols: 3, rows: 4,
    cut: 2.625 * IN, face: 2.25 * IN, safe: 1.875 * IN, bleed: 0.02 * IN, // photo window = face; NeeksxArt rim covers face→cut
    cellW: 8.3125 * IN / 3, cellH: 11 * IN / 4,
    name: '2.25" round keychain / button'
  },
  magnet: {
    perSheet: 6, cols: 2, rows: 3,
    cut: 10 / 3 * IN, chamfer: 0.7723 * IN, art: 2.54 * IN, face: 2.5 * IN, safe: 2.25 * IN,
    marginX: (8.5 * IN - 2 * (10 / 3 * IN) - 0.5 * IN) / 2, gapX: 0.5 * IN,
    marginY: IN / 6, gapY: (11 * IN - 3 * (10 / 3 * IN) - 2 * (IN / 6)) / 2,
    name: '2.5" square magnet'
  }
};

/* ---------------- text (Helvetica-Bold, built into every PDF reader) ---------------- */
// widths per 1000 units for ASCII 32..126
const HB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const latin1 = s => String(s ?? '').normalize('NFC').replace(/[^\x20-\x7e\xa0-\xff]/g, '?');
const textWidth = (s, size) => [...latin1(s)].reduce((w, ch) => w + (HB[ch.charCodeAt(0) - 32] ?? 556), 0) * size / 1000;
const pdfStr = s => '(' + latin1(s).replace(/[\\()]/g, m => '\\' + m) + ')';
const f = v => (Math.round(v * 1000) / 1000).toString();

/** text centred on (cx, cy) in top-left page coords, rotated by deg (0 = normal, 180, 90 = reads top→bottom, -90 = reads bottom→top) */
function centredText(s, size, cx, cy, deg = 0, gray = 0) {
  const w = textWidth(s, size), lift = size * 0.36; // half cap-height, so the text is visually centred
  const X = cx, Y = PAGE_H - cy;                   // to PDF coords (y up)
  let m;
  if (deg === 180) m = [-1, 0, 0, -1, X + w / 2, Y + lift];
  else if (deg === 90) m = [0, -1, 1, 0, X - lift, Y + w / 2];
  else if (deg === -90) m = [0, 1, -1, 0, X + lift, Y - w / 2];
  else m = [1, 0, 0, 1, X - w / 2, Y - lift];
  return `BT ${f(gray)} g /F1 ${f(size)} Tf ${m.map(f).join(' ')} Tm ${pdfStr(s)} Tj ET\n`;
}
/** left-aligned text whose baseline starts at (x, y) in top-left coords; deg -90 reads bottom→top */
function textAt(s, size, x, y, deg = 0, gray = 0) {
  const X = x, Y = PAGE_H - y;
  const m = deg === -90 ? [0, 1, -1, 0, X, Y] : [1, 0, 0, 1, X, Y];
  return `BT ${f(gray)} g /F1 ${f(size)} Tf ${m.map(f).join(' ')} Tm ${pdfStr(s)} Tj ET\n`;
}

/* ---------------- shapes (top-left coords in, PDF coords out) ---------------- */
const K = 0.5523; // bezier circle constant
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

/** draw image `name` (w×h px) into the box: cover = fill & crop, contain = fit inside */
function placeImage(name, img, bx, by, bw, bh, mode) {
  const a = img.w / img.h;
  let w, h;
  if (mode === 'cover') { if (a > bw / bh) { h = bh; w = bh * a; } else { w = bw; h = bw / a; } }
  else { if (a > bw / bh) { w = bw; h = bw / a; } else { h = bh; w = bh * a; } }
  const x = bx + (bw - w) / 2, y = by + (bh - h) / 2;
  return `q ${f(w)} 0 0 ${f(h)} ${f(x)} ${f(PAGE_H - y - h)} cm /${name} Do Q\n`;
}

/* ---------------- images ---------------- */
function jpegInfo(buf) {
  if (!(buf[0] === 0xff && buf[1] === 0xd8)) return null;
  let o = 2;
  while (o + 9 < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const m = buf[o + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { o += 2; continue; }
    const len = buf.readUInt16BE(o + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7), comps: buf[o + 9] };
    }
    o += 2 + len;
  }
  return null;
}

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { return null; }
}

/** → { w, h, kind: 'jpeg', data, comps } | { w, h, kind: 'raw', rgb, alpha } */
async function prepareImage(buf, { passthroughJpeg }) {
  const j = jpegInfo(buf);
  if (j && passthroughJpeg && (j.comps === 3 || j.comps === 1)) return { kind: 'jpeg', data: buf, w: j.w, h: j.h, comps: j.comps };
  const sharp = await loadSharp();
  if (!sharp) {
    if (j && (j.comps === 3 || j.comps === 1)) return { kind: 'jpeg', data: buf, w: j.w, h: j.h, comps: j.comps };
    throw new Error('This image type needs sharp, which is not installed');
  }
  const { data, info } = await sharp(buf, { density: 600, failOn: 'none' })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height, rgb = Buffer.alloc(n * 3), alpha = Buffer.alloc(n);
  let opaque = true;
  for (let i = 0; i < n; i++) {
    rgb[i * 3] = data[i * 4]; rgb[i * 3 + 1] = data[i * 4 + 1]; rgb[i * 3 + 2] = data[i * 4 + 2];
    alpha[i] = data[i * 4 + 3]; if (alpha[i] !== 255) opaque = false;
  }
  return { kind: 'raw', w: info.width, h: info.height, rgb, alpha: opaque ? null : alpha };
}

/** minimal PNG reader for our own 8-bit RGBA/RGB assets (non-interlaced) → { w, h, kind: 'raw', rgb, alpha } */
function decodePng(buf) {
  let o = 8, w, h, depth, type, inter; const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), t = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; inter = d[12]; }
    else if (t === 'IDAT') idat.push(d);
    else if (t === 'IEND') break;
    o += 12 + len;
  }
  if (depth !== 8 || inter || (type !== 6 && type !== 2)) throw new Error('unsupported PNG asset');
  const bpp = type === 6 ? 4 : 3, stride = w * bpp, raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = (y && x >= bpp) ? px[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a; else if (ft === 2) v += b; else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  const n = w * h, rgb = Buffer.alloc(n * 3), alpha = bpp === 4 ? Buffer.alloc(n) : null;
  for (let i = 0; i < n; i++) {
    rgb[i * 3] = px[i * bpp]; rgb[i * 3 + 1] = px[i * bpp + 1]; rgb[i * 3 + 2] = px[i * bpp + 2];
    if (alpha) alpha[i] = px[i * bpp + 3];
  }
  return { kind: 'raw', w, h, rgb, alpha };
}

// NeeksxArt keychain rim (black ring + gold lettering), made by scripts/build-print-templates.py
const RING_FILE = join(process.cwd(), 'print-templates', 'keychain-ring-2.625in.png');
let ringCache;
async function loadRing() {
  if (ringCache === undefined) {
    try { ringCache = decodePng(await readFile(RING_FILE)); }
    catch (e) { console.error('keychain ring', e.message); ringCache = null; }
  }
  return ringCache;
}

/* ---------------- PDF writer ---------------- */
class Pdf {
  constructor() { this.objs = []; }
  add(dict, stream) { this.objs.push({ dict, stream }); return this.objs.length; }
  reserve() { this.objs.push(null); return this.objs.length; }
  set(id, dict, stream) { this.objs[id - 1] = { dict, stream }; }
  toBuffer() {
    const parts = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
    let len = parts[0].length;
    const offsets = [];
    this.objs.forEach((o, i) => {
      offsets.push(len);
      const head = Buffer.from(`${i + 1} 0 obj\n${o.dict}${o.stream ? `\nstream\n` : '\n'}`, 'latin1');
      const tail = Buffer.from(o.stream ? '\nendstream\nendobj\n' : 'endobj\n', 'latin1');
      const chunk = o.stream ? [head, o.stream, tail] : [head, tail];
      chunk.forEach(c => { parts.push(c); len += c.length; });
    });
    const xref = [`xref\n0 ${this.objs.length + 1}\n0000000000 65535 f \n`, ...offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
    parts.push(Buffer.from(`${xref}trailer\n<< /Size ${this.objs.length + 1} /Root 1 0 R /Info ${this.info} 0 R >>\nstartxref\n${len}\n%%EOF\n`, 'latin1'));
    return Buffer.concat(parts);
  }
}

function embedImage(pdf, img) {
  if (img.kind === 'jpeg') {
    return pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /${img.comps === 1 ? 'DeviceGray' : 'DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>`, img.data);
  }
  let smask = '';
  if (img.alpha) {
    const a = deflateSync(img.alpha);
    const id = pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${a.length} >>`, a);
    smask = ` /SMask ${id} 0 R`;
  }
  const c = deflateSync(img.rgb);
  return pdf.add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode${smask} /Length ${c.length} >>`, c);
}

/* ---------------- sheet drawing ---------------- */
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
  let out = '';
  // MPRO grid
  out += `q 0.71 G 0.5 w `;
  for (let c = 1; c <= S.cols; c++) out += line(c * S.cellW, 0, c * S.cellW, PAGE_H);
  for (let r = 1; r < S.rows; r++) out += line(0, r * S.cellH, S.cols * S.cellW, r * S.cellH);
  out += 'S Q\n';
  roundSlots().forEach((s, i) => {
    const p = pieces[i];
    if (p) {
      if (fit === 'photo') {
        // with the rim: photo fills the 2.25" window (+ a hair of bleed under the rim); without it: whole cut circle
        const d = ring ? S.face + 2 * S.bleed : S.cut;
        out += `q ${circlePath(s.cx, s.cy, d / 2)}W n\n` + placeImage(p.name, p.img, s.cx - d / 2, s.cy - d / 2, d, d, 'cover') + 'Q\n';
      } else {
        // logo: largest box (same shape as the logo) that fits inside the safe circle
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

function drawMagnetPage(pieces, fit, footer) {
  const S = SHEETS.magnet;
  const flapFs = Math.min(7.5, 1.55 * IN / (textWidth('Custom Merch by @neeksxart', 1)));
  const band = (S.cut - S.art) / 2, off = S.art / 2 + band * 0.42;
  let out = '';
  magnetSlots().forEach((s, i) => {
    const p = pieces[i];
    if (p) {
      if (fit === 'photo') {
        out += `q ${rectPath(s.cx - S.art / 2, s.cy - S.art / 2, S.art, S.art)}W n\n` + placeImage(p.name, p.img, s.cx - S.art / 2, s.cy - S.art / 2, S.art, S.art, 'cover') + 'Q\n';
      } else {
        out += placeImage(p.name, p.img, s.cx - S.safe / 2, s.cy - S.safe / 2, S.safe, S.safe, 'contain');
      }
      out += centredText('Custom Merch by @neeksxart', flapFs, s.cx, s.cy - off, 180);
      out += centredText('neeksxart.com', flapFs, s.cx, s.cy + off, 180);
      out += centredText('Instagram: @neeksxart', flapFs, s.cx - off, s.cy, -90);
      out += centredText('info@neeksxart.com', flapFs, s.cx + off, s.cy, 90);
      if (p.label) out += textAt(p.label, 7, s.x + 4, s.y + 11, 0, 0.35);
    }
    out += `q 0 G 0.75 w ${octagonPath(s.x, s.y, S.cut, S.chamfer)}S Q\n`;
  });
  out += textAt(footer, 5.6, S.marginX / 2 + 2, PAGE_H - IN / 4, -90, 0.2);
  return out;
}

/**
 * pieces: [{ image: Buffer, kind: 'magnet'|'round', label?: string, key?: string }]
 *   pieces with the same `key` share one embedded image (e.g. one logo repeated).
 * Pages are grouped: all magnet sheets first, then round sheets.
 */
export async function buildPrintSheet({ pieces, fit = 'photo', title = '' }) {
  const pdf = new Pdf();
  const catalog = pdf.reserve(), pagesId = pdf.reserve();
  const font = pdf.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  const cache = new Map();
  const ready = [];
  for (const [i, p] of pieces.entries()) {
    const key = p.key || `img${i}`;
    if (!cache.has(key)) {
      const img = await prepareImage(p.image, { passthroughJpeg: fit === 'photo' });
      cache.set(key, { name: `Im${cache.size + 1}`, img, id: embedImage(pdf, img) });
    }
    const e = cache.get(key);
    ready.push({ ...p, name: e.name, img: e.img });
  }

  const pages = [];
  for (const kind of ['magnet', 'round']) {
    const list = ready.filter(p => p.kind === kind);
    const per = SHEETS[kind].perSheet, total = Math.ceil(list.length / per);
    for (let s = 0; s < total; s++) pages.push({ kind, list: list.slice(s * per, (s + 1) * per), n: s + 1, total });
  }

  let ring = null, xobjects = [...cache.values()].map(e => `/${e.name} ${e.id} 0 R`).join(' ');
  if (pages.some(pg => pg.kind === 'round')) {
    ring = await loadRing();
    if (ring) xobjects += ` /Ring ${embedImage(pdf, ring)} 0 R`;
  }
  const kids = pages.map(pg => {
    const footer = `${title ? title + '  ·  ' : ''}${SHEETS[pg.kind].name}  ·  sheet ${pg.n} of ${pg.total}  ·  Letter 8.5 x 11 in  ·  Print at 100% / Actual size`;
    const content = pg.kind === 'round' ? drawRoundPage(pg.list, fit, footer, ring) : drawMagnetPage(pg.list, fit, footer);
    const z = deflateSync(Buffer.from(content, 'latin1'));
    const cid = pdf.add(`<< /Length ${z.length} /Filter /FlateDecode >>`, z);
    return pdf.add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${cid} 0 R ` +
      `/Resources << /Font << /F1 ${font} 0 R >> /XObject << ${xobjects} >> >> >>`);
  });
  pdf.set(pagesId, `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  pdf.set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  pdf.info = pdf.add(`<< /Title ${pdfStr(title || 'NeeksxArt print sheet')} /Producer (NeeksxArt dashboard) >>`);
  return pdf.toBuffer();
}

/** which press template a pop-up item goes on — same rule the order page uses for round vs square */
export const pieceKind = (item, shape) => (shape === 'round' || (item && item !== 'magnet')) ? 'round' : 'magnet';

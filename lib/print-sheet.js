import 'server-only';
// Server side of the print-sheet engine (lib/print-sheet-core.js): loads images with Node,
// then renders the PDF. Used by /api/admin/print-sheet (pop-up orders + inquiry logos).
//
//   buildPrintSheet({ pieces: [{ image: Buffer, kind, key? }], fit, title, flaps })  →  Buffer (PDF)
//
// Sheets are the client's own templates (print-templates/frame-*.png) with photos placed in the windows.
//
// JPEG photos are embedded as-is (no re-compression). Other formats (PNG, WebP, SVG, GIF) go
// through sharp, which ships with Next.js.
import { deflateSync, inflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderPrintPdf, jpegInfo, frameFromPixels, frameFile, SHEETS, pieceKind } from './print-sheet-core';

export { SHEETS, pieceKind };

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

// The client's press templates with see-through photo windows, made by scripts/build-print-templates.py
const frameCache = new Map();
async function loadFrame(kind, flaps) {
  const file = frameFile(kind, flaps);
  if (!frameCache.has(file)) {
    const png = decodePng(await readFile(join(process.cwd(), 'print-templates', file)));
    frameCache.set(file, frameFromPixels(png.rgb, png.w, png.h, 3));
  }
  return frameCache.get(file);
}

/**
 * pieces: [{ image: Buffer, kind: 'magnet'|'round', key?: string }]
 *   pieces with the same `key` share one embedded image (e.g. one logo repeated).
 */
export async function buildPrintSheet({ pieces, fit = 'photo', title = '', flaps = true }) {
  const cache = new Map(), prepared = [];
  for (const [i, p] of pieces.entries()) {
    const key = p.key || `img${i}`;
    if (!cache.has(key)) cache.set(key, await prepareImage(p.image, { passthroughJpeg: fit === 'photo' }));
    prepared.push({ kind: p.kind, key, img: cache.get(key) });
  }
  const frames = {};
  for (const kind of new Set(prepared.map(p => p.kind))) frames[kind] = await loadFrame(kind, flaps);
  const bytes = await renderPrintPdf({ pieces: prepared, fit, title, frames, deflate: async u => deflateSync(u) });
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length);
}

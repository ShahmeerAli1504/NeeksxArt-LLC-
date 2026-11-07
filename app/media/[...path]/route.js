// Fallback for site photos/videos before Supabase is connected:
// serves files from supabase/seed-media at /media/<path> (with Range support for videos).
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';

export const runtime = 'nodejs';

const ROOT = join(process.cwd(), 'supabase', 'seed-media');
const TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm'
};

export async function GET(req, { params }) {
  const { path = [] } = await params;
  const file = normalize(join(ROOT, ...path));
  const type = TYPES[extname(file).toLowerCase()];
  if (!file.startsWith(ROOT + sep) || !type) return new Response('Not found', { status: 404 });

  let info;
  try { info = await stat(file); } catch { return new Response('Not found', { status: 404 }); }
  if (!info.isFile()) return new Response('Not found', { status: 404 });

  const data = await readFile(file);
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=3600' };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (range) {
    const size = data.length;
    const start = range[1] ? parseInt(range[1], 10) : size - parseInt(range[2], 10);
    const end = range[1] && range[2] ? Math.min(parseInt(range[2], 10), size - 1) : size - 1;
    if (start >= size || start < 0 || end < start) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new Response(data.subarray(start, end + 1), {
      status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) }
    });
  }
  return new Response(data, { headers: { ...headers, 'Content-Length': String(data.length) } });
}

#!/usr/bin/env node
/**
 * Puts every website photo & video into Supabase Storage (bucket `site-media`).
 *
 *   npm run media:upload          upload anything that isn't there yet
 *   npm run media:upload:force    re-upload everything (after replacing a photo)
 *
 * 1. supabase/seed-media/**      → site-media/img/..., site-media/video/...
 * 2. product photos from the old Shopify store (lib/catalog.js) → resized .webp in site-media/catalog/
 *
 * To add or change a photo later: drop it in supabase/seed-media/img, run this script,
 * then reference it in code with media('img/your-file.jpg').
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, LIVE, SHOPIFY_CDN, catalogKey } from '../lib/catalog.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = join(ROOT, 'supabase', 'seed-media');
const BUCKET = process.env.NEXT_PUBLIC_MEDIA_BUCKET || 'site-media';
const FORCE = process.argv.includes('--force');
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm' };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('✖ Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local first (see .env.example).');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

// ---------- make sure the buckets exist (in case schema.sql hasn't been run yet) ----------
async function ensureBucket(id, opts) {
  const { data } = await sb.storage.getBucket(id);
  if (data) return;
  const { error } = await sb.storage.createBucket(id, opts);
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`＋ created bucket ${id}`);
}
await ensureBucket(BUCKET, { public: true, fileSizeLimit: 52428800 });
await ensureBucket('customer-uploads', { public: false, fileSizeLimit: 10485760 });
await ensureBucket('event-photos', { public: false, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png'] });

// ---------- what's already uploaded ----------
async function listAll(prefix) {
  const out = new Set();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    data.filter(f => f.id).forEach(f => out.add(prefix ? `${prefix}/${f.name}` : f.name));
    if (data.length < 1000) break;
  }
  return out;
}
const existing = new Set();
for (const p of ['img', 'video', 'catalog', 'catalog/thumbs']) (await listAll(p)).forEach(x => existing.add(x));

let uploaded = 0, skipped = 0, failed = 0;
async function put(path, body, contentType) {
  if (!FORCE && existing.has(path)) { skipped++; return; }
  const { error } = await sb.storage.from(BUCKET).upload(path, body, { contentType, upsert: true, cacheControl: '2592000' });
  if (error) { failed++; console.error(`✖ ${path}: ${error.message}`); return; }
  uploaded++; console.log(`↑ ${path}`);
}

// ---------- 1. local photos & videos ----------
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(e => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return files.flat();
}
for (const file of await walk(SEED)) {
  const type = TYPES[extname(file).toLowerCase()];
  if (!type) continue;
  await put(relative(SEED, file).split('\\').join('/'), await readFile(file), type);
}

// ---------- 2. product photos from the old Shopify store ----------
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('! sharp not installed: product photos are uploaded without resizing.'); }

const shopifyFiles = [...new Set([...PRODUCTS.flatMap(p => p.imgs || []), ...LIVE.map(l => l.img)])];
for (const f of shopifyFiles) {
  const name = catalogKey(f);
  const big = `catalog/${name}`, small = `catalog/thumbs/${name}`;
  if (!FORCE && existing.has(big) && existing.has(small)) { skipped += 2; continue; }
  try {
    // iPhone .heic photos can't be decoded here or shown in most browsers: ask Shopify's CDN for a JPG
    const res = await fetch(SHOPIFY_CDN + f + (/\.heic/i.test(f) ? (f.includes('?') ? '&' : '?') + 'width=1400&format=jpg' : ''));
    if (!res.ok) throw new Error(`HTTP ${res.status} from Shopify`);
    const src = Buffer.from(await res.arrayBuffer());
    if (sharp) {
      const full = await sharp(src).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const thumb = await sharp(src).rotate().resize({ width: 240, height: 240, fit: 'cover' }).webp({ quality: 75 }).toBuffer();
      await put(big, full, 'image/webp');
      await put(small, thumb, 'image/webp');
    } else {
      const type = res.headers.get('content-type') || 'image/jpeg';
      await put(big, src, type);
      await put(small, src, type);
    }
  } catch (e) {
    failed++; console.error(`✖ ${f}: ${e.message}`);
  }
}

console.log(`\nDone: ${uploaded} uploaded, ${skipped} already there, ${failed} failed.`);
console.log(`Public URL base: ${url.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/`);
if (failed) process.exit(1);

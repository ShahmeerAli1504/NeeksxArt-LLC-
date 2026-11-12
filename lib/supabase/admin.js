import 'server-only';
import { createClient } from '@supabase/supabase-js';

export const BUCKETS = {
  media: process.env.NEXT_PUBLIC_MEDIA_BUCKET || 'site-media', // public: site photos & videos
  uploads: 'customer-uploads', // private: logos + Merch Studio mockups from the contact form
  events: 'event-photos' // private: photos guests upload at live pop-ups
};

let client;

/** Server-side Supabase client with the service-role key. Returns null until Supabase is configured. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

/** data:image/...;base64,... → { buffer, contentType, ext } */
export function decodeDataUrl(dataUrl) {
  const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  const contentType = m[1];
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' }[contentType] || 'bin';
  return { buffer: Buffer.from(m[2], 'base64'), base64: m[2], contentType, ext };
}

/** options.download: true (or a file name) makes the link download instead of opening */
export async function signedUrls(bucket, paths, expiresIn = 60 * 60, options) {
  const sb = supabaseAdmin();
  const list = (paths || []).filter(Boolean);
  if (!sb || !list.length) return {};
  const { data, error } = await sb.storage.from(bucket).createSignedUrls(list, expiresIn, options);
  if (error) { console.error('signed urls', error); return {}; }
  return Object.fromEntries(data.filter(d => d.signedUrl).map(d => [d.path, d.signedUrl]));
}

/**
 * Every site photo and video lives in the public Supabase Storage bucket `site-media`
 * (uploaded once with `npm run media:upload`). This helper turns a path inside that
 * bucket into a full URL, e.g. media('img/neeks-studio.jpg').
 *
 * Before Supabase is connected (no NEXT_PUBLIC_SUPABASE_URL), files are served from
 * supabase/seed-media through the /media route, so the site still works locally.
 *
 * Safe in server and client components (only reads NEXT_PUBLIC_ variables).
 */
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
export const MEDIA_BUCKET = process.env.NEXT_PUBLIC_MEDIA_BUCKET || 'site-media';
export const USING_SUPABASE = !!SUPABASE_URL;

export const MEDIA_BASE = USING_SUPABASE
  ? `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}`
  : '/media';

export function media(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_BASE}/${String(path).replace(/^\/+/, '')}`;
}

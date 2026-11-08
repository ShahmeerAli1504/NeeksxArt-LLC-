import 'server-only';
// Exactly 4 photos per product. Each slot is either a photo uploaded from the dashboard
// (Product photos page → public.product_photos + the site-media bucket under products/)
// or, until one is uploaded, the product's original photo from lib/catalog.js.
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PRODUCTS, pics, thumbs } from '@/lib/catalog';
import { media } from '@/lib/media';

export const SLOTS = 4;

/** { [productId]: { big: [url…], small: [url…], custom: [bool…], missing: n } } — at most 4 each */
export async function getProductPhotos() {
  let rows = [];
  const sb = supabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from('product_photos').select('product_id, slot, path, thumb_path');
    if (!error) rows = data || [];
  }
  const out = {};
  for (const p of PRODUCTS) {
    const big = pics(p), small = thumbs(p);
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const r = rows.find(x => x.product_id === p.id && x.slot === i + 1);
      if (r) return { big: media(r.path), small: media(r.thumb_path || r.path), custom: true };
      return big[i] ? { big: big[i], small: small[i] || big[i], custom: false } : null;
    }).filter(Boolean);
    out[p.id] = { big: slots.map(s => s.big), small: slots.map(s => s.small), custom: slots.map(s => s.custom), missing: SLOTS - slots.length };
  }
  return out;
}

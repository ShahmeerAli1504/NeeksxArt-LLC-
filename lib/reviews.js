import 'server-only';
// Customer reviews: written on the website (approved in Dashboard → Reviews before they show)
// and Yelp reviews added from Yelp's own "Embed review" code. Table: public.reviews.
import { supabaseAdmin } from '@/lib/supabase/admin';

export const YELP_URL = process.env.NEXT_PUBLIC_YELP_URL || 'https://www.yelp.com/biz/neeks-x-art-reno';

/** approved reviews for the site: { site: [...], yelp: [...], average, count, yelpUrl } */
export async function getReviews({ limit = 60 } = {}) {
  const empty = { site: [], yelp: [], average: 0, count: 0, yelpUrl: YELP_URL };
  const sb = supabaseAdmin();
  if (!sb) return empty;
  const { data, error } = await sb.from('reviews').select('id, created_at, source, name, rating, body, product, yelp_review_id, yelp_url, yelp_biz_url')
    .eq('status', 'approved').order('created_at', { ascending: false }).limit(limit);
  if (error) return empty;
  const site = (data || []).filter(r => r.source === 'site');
  const yelp = (data || []).filter(r => r.source === 'yelp' && r.yelp_review_id);
  const rated = site.filter(r => r.rating);
  return {
    site, yelp, count: site.length,
    average: rated.length ? Math.round(rated.reduce((a, r) => a + r.rating, 0) / rated.length * 10) / 10 : 0,
    yelpUrl: YELP_URL || yelp.find(r => r.yelp_biz_url)?.yelp_biz_url || ''
  };
}

/** pull the review id, reviewer and links out of Yelp's "Embed review" code (nothing else is kept) */
export function parseYelpEmbed(code) {
  const s = String(code || '');
  const id = /data-review-id="([A-Za-z0-9_-]{10,40})"/.exec(s)?.[1] || /[?&]hrid=([A-Za-z0-9_-]{10,40})/.exec(s)?.[1];
  if (!id) return null;
  const links = [...s.matchAll(/<a href="(https:\/\/www\.yelp\.com\/[^"]*)"[^>]*>([^<]{1,120})<\/a>/g)].map(m => ({ href: m[1], text: m[2] }));
  const user = links.find(l => l.href.includes('/user_details'));
  const biz = links.find(l => /\/biz\/[^?"]+$/.test(l.href)) || links.find(l => l.href.includes('/biz/'));
  const review = links.find(l => l.href.includes('hrid='));
  const clean = u => (u ? u.replace(/&amp;/g, '&').split('&utm_')[0] : null);
  return {
    yelp_review_id: id,
    name: user?.text?.trim() || 'Yelp reviewer',
    yelp_url: clean(review?.href) || null,
    yelp_biz_url: biz ? clean(biz.href).split('?')[0] : null,
    biz_name: biz?.text?.trim() || 'NeeksxArt'
  };
}

// "Leave a review" on the website. Reviews are saved as pending and only appear after approval
// in Dashboard → Reviews. The owner gets an email for each new one.
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail, table, siteUrl } from '@/lib/email';
import { PRODUCTS } from '@/lib/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const bad = (error, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Bad request'); }
  if (b.website) return NextResponse.json({ ok: true });                     // honeypot: bots fill hidden fields
  if (!(Number(b.elapsed) >= 3000)) return NextResponse.json({ ok: true }); // submitted too fast to be a person
  const name = clean(b.name, 60), body = String(b.body ?? '').trim().slice(0, 1500);
  const rating = Math.round(Number(b.rating));
  const product = PRODUCTS.some(p => p.name === b.product) || ['Live pop-up', 'Event favors', 'Other'].includes(b.product) ? b.product : null;
  if (!name) return bad('Please add your name.');
  if (!(rating >= 1 && rating <= 5)) return bad('Please pick a star rating.');
  if (body.length < 10) return bad('Please write a few words about your order.');

  const sb = supabaseAdmin();
  if (!sb) return bad('Reviews are not connected yet. Please try again soon.', 503);
  const { error } = await sb.from('reviews').insert({ source: 'site', status: 'pending', name, rating, body, product });
  if (error) { console.error('review', error); return bad('Could not save your review. Please try again.', 500); }

  await sendEmail({
    subject: `New ${rating}★ review from ${name} — approve it in the dashboard`,
    html: `<p>A new review is waiting for approval.</p>${table([['Name', name], ['Rating', '★'.repeat(rating)], ['Product', product || '—'], ['Review', body]])}<p><a href="${siteUrl()}/admin/reviews">Open Dashboard → Reviews</a></p>`
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}

'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseYelpEmbed } from '@/lib/reviews';

const done = () => { revalidatePath('/admin/reviews'); revalidatePath('/reviews'); revalidatePath('/'); };

export async function setReviewStatus(formData) {
  await requireAdmin();
  const status = String(formData.get('status'));
  if (!['approved', 'hidden', 'pending'].includes(status)) return;
  await supabaseAdmin()?.from('reviews').update({ status }).eq('id', String(formData.get('id')));
  done();
}

export async function deleteReview(formData) {
  await requireAdmin();
  await supabaseAdmin()?.from('reviews').delete().eq('id', String(formData.get('id')));
  done();
}

/** paste the code from a Yelp review's "Embed review" button */
export async function addYelpReview(formData) {
  await requireAdmin();
  const y = parseYelpEmbed(formData.get('code'));
  if (!y) redirect('/admin/reviews?yelp=bad');
  const sb = supabaseAdmin();
  const { data: dupe } = await sb.from('reviews').select('id').eq('yelp_review_id', y.yelp_review_id).maybeSingle();
  if (!dupe) await sb.from('reviews').insert({ source: 'yelp', status: 'approved', name: y.name, yelp_review_id: y.yelp_review_id, yelp_url: y.yelp_url, yelp_biz_url: y.yelp_biz_url });
  done();
  redirect('/admin/reviews?yelp=added');
}

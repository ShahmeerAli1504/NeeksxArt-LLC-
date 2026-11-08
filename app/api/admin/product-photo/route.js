// Dashboard → Product photos: replace (POST) or reset (DELETE) one of a product's 4 photo slots.
// The browser resizes before upload (main ≤1600 px + thumbnail), so requests stay small.
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { PRODUCTS } from '@/lib/catalog';
import { SLOTS } from '@/lib/product-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error, status = 400) => NextResponse.json({ ok: false, error }, { status });
const refresh = () => ['/catalog', '/magnets', '/'].forEach(p => revalidatePath(p));

function target(id, slot) {
  if (!PRODUCTS.some(p => p.id === id)) return null;
  const n = Number(slot);
  return Number.isInteger(n) && n >= 1 && n <= SLOTS ? n : null;
}

async function removeOld(sb, id, slot) {
  const { data } = await sb.from('product_photos').select('path, thumb_path').eq('product_id', id).eq('slot', slot).maybeSingle();
  if (data) await sb.storage.from(BUCKETS.media).remove([data.path, data.thumb_path].filter(Boolean));
}

export async function POST(req) {
  if (!(await isAdmin())) return fail('Unauthorized', 401);
  const sb = supabaseAdmin();
  if (!sb) return fail('Supabase is not connected', 503);
  const form = await req.formData();
  const id = String(form.get('id') || ''), slot = target(id, form.get('slot'));
  const image = form.get('image'), thumb = form.get('thumb');
  if (!slot) return fail('Unknown product or slot');
  if (!image || typeof image === 'string' || image.size > 4 * 1024 * 1024 || !/^image\/(jpeg|png|webp)$/.test(image.type)) return fail('Send a JPG, PNG or WebP under 4 MB');

  const stamp = Date.now().toString(36);
  const path = `products/${id}/${slot}-${stamp}.jpg`, thumbPath = `products/${id}/thumbs/${slot}-${stamp}.jpg`;
  const up = async (p, f) => {
    const { error } = await sb.storage.from(BUCKETS.media).upload(p, Buffer.from(await f.arrayBuffer()), { contentType: f.type, upsert: true, cacheControl: '31536000' });
    if (error) throw error;
  };
  try {
    await removeOld(sb, id, slot);
    await up(path, image);
    if (thumb && typeof thumb !== 'string') await up(thumbPath, thumb);
    const { error } = await sb.from('product_photos').upsert({ product_id: id, slot, path, thumb_path: thumb ? thumbPath : null, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error('product photo', e);
    return fail(e.message || 'Upload failed', 500);
  }
  refresh();
  return NextResponse.json({ ok: true, path });
}

export async function DELETE(req) {
  if (!(await isAdmin())) return fail('Unauthorized', 401);
  const sb = supabaseAdmin();
  if (!sb) return fail('Supabase is not connected', 503);
  const q = new URL(req.url).searchParams;
  const id = String(q.get('id') || ''), slot = target(id, q.get('slot'));
  if (!slot) return fail('Unknown product or slot');
  await removeOld(sb, id, slot);
  const { error } = await sb.from('product_photos').delete().eq('product_id', id).eq('slot', slot);
  if (error) return fail(error.message, 500);
  refresh();
  return NextResponse.json({ ok: true });
}

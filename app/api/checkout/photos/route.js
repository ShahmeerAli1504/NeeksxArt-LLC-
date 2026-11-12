// Online checkout, before paying: hand back one-time upload links so the customer's browser
// uploads their cropped photos straight to Supabase Storage (no 4.5 MB request limit).
// The photos are tied to the order when /api/checkout confirms the payment.
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin, BUCKETS } from '@/lib/supabase/admin';
import { MAX_PHOTOS } from '@/lib/shop-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { b = {}; }
  const count = Math.round(Number(b?.count));
  if (!(count >= 1 && count <= MAX_PHOTOS)) return NextResponse.json({ ok: false, error: 'Bad photo count' }, { status: 400 });

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, mode: 'none' }); // local demo without Supabase: no uploads

  const uploadId = randomUUID();
  const folder = `shop/${uploadId}`;
  try {
    const uploads = await Promise.all(Array.from({ length: count }, async (_, i) => {
      const path = `${folder}/${String(i + 1).padStart(2, '0')}.jpg`;
      const { data, error } = await sb.storage.from(BUCKETS.uploads).createSignedUploadUrl(path, { upsert: true });
      if (error) throw error;
      return { path: data.path || path, token: data.token };
    }));
    return NextResponse.json({ ok: true, mode: 'storage', uploadId, bucket: BUCKETS.uploads, uploads });
  } catch (e) {
    console.error('checkout photo upload urls', e);
    return NextResponse.json({ ok: false, error: 'Photo upload is not available right now. Please try again.' }, { status: 500 });
  }
}

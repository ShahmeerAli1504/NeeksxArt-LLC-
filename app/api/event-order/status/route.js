// Guest ticket polls this to show "Pressing now" / "Ready for pickup".
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  const token = searchParams.get('t') || '';
  const sb = supabaseAdmin();
  if (!sb || !id || !/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ ok: false }, { status: 400 });
  const { data } = await sb.from('event_orders').select('status').eq('order_id', id).eq('token', token).maybeSingle();
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, status: data.status }, { headers: { 'Cache-Control': 'no-store' } });
}

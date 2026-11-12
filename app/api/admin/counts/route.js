// Dashboard tab badges: how many orders / inquiries / reviews are waiting. Staff only.
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { adminCounts } from '@/lib/admin-counts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, counts: await adminCounts() }, { headers: { 'Cache-Control': 'no-store' } });
}

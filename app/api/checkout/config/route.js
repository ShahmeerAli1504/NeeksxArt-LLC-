// What the checkout page needs to show the card field: demo mode, or Square's app + location IDs.
// The access token never leaves the server.
import { NextResponse } from 'next/server';
import { publicPaymentConfig } from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await publicPaymentConfig(), { headers: { 'Cache-Control': 'no-store' } });
}

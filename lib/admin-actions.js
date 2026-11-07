'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkPassword, startSession, endSession, requireAdmin } from '@/lib/admin-auth';
import { ORDER_STATUSES } from '@/lib/bundles';

export async function login(_prev, formData) {
  if (!process.env.ADMIN_PASSWORD) return { error: 'Set ADMIN_PASSWORD in your environment variables first.' };
  if (!checkPassword(formData.get('password'))) return { error: 'Wrong password.' };
  await startSession();
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

export async function setOrderStatus(formData) {
  await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!ORDER_STATUSES.includes(status)) return;
  await supabaseAdmin()?.from('event_orders').update({ status }).eq('id', id);
  revalidatePath('/admin');
}

const INQUIRY_STATUSES = ['new', 'replied', 'won', 'archived'];
export async function setInquiryStatus(formData) {
  await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!INQUIRY_STATUSES.includes(status)) return;
  await supabaseAdmin()?.from('inquiries').update({ status }).eq('id', id);
  revalidatePath('/admin/inquiries');
}

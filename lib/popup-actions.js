'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { getPopup, savePopup, popupValue } from '@/lib/popup';

export async function startPopup(formData) {
  await requireAdmin();
  await savePopup(popupValue(formData.get('name'), formData.get('hours')));
  revalidatePath('/admin'); revalidatePath('/event');
}

export async function endPopup() {
  await requireAdmin();
  const p = await getPopup();
  await savePopup({ live: false, name: p.name, slug: p.slug, ended_at: new Date().toISOString() });
  revalidatePath('/admin'); revalidatePath('/event');
}

'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { getPopup, savePopup, popupValue } from '@/lib/popup';

// pages that show or hide "Order live" links when the switch changes
const refresh = () => ['/admin', '/admin/inquiries', '/admin/products', '/admin/reviews', '/admin/payments', '/admin/templates', '/event', '/events', '/'].forEach(p => revalidatePath(p));

export async function startPopup(formData) {
  await requireAdmin();
  await savePopup(popupValue(formData.get('name'), formData.get('hours'), formData.get('tax'), formData.get('customRate')));
  refresh();
}

export async function endPopup() {
  await requireAdmin();
  const p = await getPopup();
  await savePopup({ live: false, name: p.name, slug: p.slug, tax_id: p.taxId, tax_label: p.taxLabel, tax_rate: p.taxRate, ended_at: new Date().toISOString() });
  refresh();
}

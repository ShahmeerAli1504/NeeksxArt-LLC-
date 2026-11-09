'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { getPopup, savePopup, popupValue, getPopupTaxRates, savePopupTaxRates } from '@/lib/popup';
import { cleanRate, POPUP_TAX } from '@/lib/popup-tax';
import { slugify } from '@/lib/bundles';

// pages that show or hide "Order live" links when the switch changes
const refresh = () => ['/admin', '/admin/inquiries', '/admin/products', '/admin/reviews', '/admin/payments', '/admin/templates', '/event', '/events', '/'].forEach(p => revalidatePath(p));

export async function startPopup(formData) {
  await requireAdmin();
  const { rates } = await getPopupTaxRates();
  await savePopup(popupValue(formData.get('name'), formData.get('hours'), formData.get('tax'), formData.get('customRate'), rates));
  refresh();
}

export async function endPopup() {
  await requireAdmin();
  const p = await getPopup();
  await savePopup({ live: false, name: p.name, slug: p.slug, tax_id: p.taxId, tax_label: p.taxLabel, tax_rate: p.taxRate, ended_at: new Date().toISOString() });
  refresh();
}

/** Save the pop-up tax locations edited in the dashboard (rate_<id>, label_<id>, remove_<id>, new_label/new_rate). */
export async function saveTaxRates(formData) {
  await requireAdmin();
  const { rates } = await getPopupTaxRates();
  const next = [];
  for (const t of rates) {
    if (formData.get(`remove_${t.id}`)) continue;
    const label = String(formData.get(`label_${t.id}`) ?? t.label).trim().slice(0, 60) || t.label;
    const rate = cleanRate(formData.get(`rate_${t.id}`));
    next.push({ id: t.id, label, rate: rate ?? t.rate });
  }
  const newLabel = String(formData.get('new_label') || '').trim().slice(0, 60);
  const newRate = cleanRate(formData.get('new_rate'));
  if (newLabel && newRate != null) {
    let id = slugify(newLabel);
    while (next.some(t => t.id === id) || id === 'custom') id += '-2';
    next.push({ id, label: newLabel, rate: newRate });
  }
  await savePopupTaxRates(next.length ? next : POPUP_TAX);

  // a live pop-up keeps charging the rate it started with unless its location's rate was just changed
  const p = await getPopup();
  const hit = p.live && next.find(t => t.id === p.taxId);
  if (hit && (hit.rate !== p.taxRate || hit.label !== p.taxLabel)) {
    await savePopup({ live: true, name: p.name, slug: p.slug, started_at: p.startedAt, ends_at: p.endsAt, tax_id: hit.id, tax_label: hit.label, tax_rate: hit.rate });
  }
  refresh();
}

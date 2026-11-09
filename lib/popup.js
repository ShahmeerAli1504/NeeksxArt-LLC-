import 'server-only';
// Live pop-up on/off switch. The guest order page (/event) and its APIs only accept orders while a
// pop-up is live. Started and ended from the dashboard (Pop-up orders → Pop-up status); it also
// closes itself at the end time so ordering never stays open by accident.
// Stored in public.site_settings (key 'popup'). Without Supabase it's always closed, unless
// POPUP_ALWAYS_OPEN=1 is set (for a demo before the database is connected).
import { supabaseAdmin } from '@/lib/supabase/admin';
import { slugify } from '@/lib/bundles';
import { popupTaxFrom, POPUP_TAX } from '@/lib/popup-tax';

export async function getPopup() {
  if (process.env.POPUP_ALWAYS_OPEN === '1') return { live: true, configured: false, slug: 'pop-up', name: 'Pop-Up', forced: true, taxLabel: 'Reno / Sparks (Washoe County)', taxRate: 8.265 };
  const sb = supabaseAdmin();
  if (!sb) return { live: false, configured: false };
  const { data, error } = await sb.from('site_settings').select('value').eq('key', 'popup').maybeSingle();
  if (error) return { live: false, configured: false, error: error.message };
  const v = data?.value || {};
  const open = !!v.live && (!v.ends_at || Date.now() < Date.parse(v.ends_at));
  return {
    live: open, configured: true, slug: v.slug || 'pop-up', name: v.name || 'Pop-Up',
    startedAt: v.started_at || null, endsAt: v.ends_at || null, expired: !!v.live && !open,
    taxId: v.tax_id || 'washoe', taxLabel: v.tax_label || 'Reno / Sparks (Washoe County)', taxRate: v.tax_rate ?? 8.265
  };
}

export async function savePopup(value) {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase is not connected');
  const { error } = await sb.from('site_settings').upsert({ key: 'popup', value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Pop-up tax locations: the list Neeks saved in the dashboard, or the starting list in lib/popup-tax.js */
export async function getPopupTaxRates() {
  const sb = supabaseAdmin();
  if (!sb) return { rates: POPUP_TAX, saved: false };
  const { data } = await sb.from('site_settings').select('value').eq('key', 'popup_tax').maybeSingle();
  const list = Array.isArray(data?.value?.rates) ? data.value.rates.filter(t => t?.id && t?.label && Number.isFinite(Number(t.rate))) : [];
  return list.length ? { rates: list.map(t => ({ id: t.id, label: t.label, rate: Number(t.rate) })), saved: true, updatedAt: data.value.updated_at || null } : { rates: POPUP_TAX, saved: false };
}

export async function savePopupTaxRates(rates) {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase is not connected');
  const value = { rates, updated_at: new Date().toISOString() };
  const { error } = await sb.from('site_settings').upsert({ key: 'popup_tax', value, updated_at: value.updated_at });
  if (error) throw error;
}

/** hours: 1–24, or 'off' = stays on until it's switched off in the dashboard */
export const popupValue = (name, hours, taxId, customRate, taxList) => {
  const now = Date.now();
  const nm = String(name || '').trim().slice(0, 60) || 'Pop-Up';
  const h = hours === 'off' ? null : Math.min(24, Math.max(1, Number(hours) || 8));
  const tax = popupTaxFrom(taxId, customRate, taxList);
  return {
    live: true, name: nm, slug: slugify(nm), started_at: new Date(now).toISOString(),
    ends_at: h ? new Date(now + h * 3600e3).toISOString() : null,
    tax_id: taxId === 'custom' ? 'custom' : (taxId || 'washoe'), tax_label: tax.label, tax_rate: tax.rate
  };
};

import 'server-only';
// Live pop-up on/off switch. The guest order page (/event) and its APIs only accept orders while a
// pop-up is live. Started and ended from the dashboard (Pop-up orders → Pop-up status); it also
// closes itself at the end time so ordering never stays open by accident.
// Stored in public.site_settings (key 'popup'). Without Supabase it's always closed, unless
// POPUP_ALWAYS_OPEN=1 is set (for a demo before the database is connected).
import { supabaseAdmin } from '@/lib/supabase/admin';
import { slugify } from '@/lib/bundles';

export async function getPopup() {
  if (process.env.POPUP_ALWAYS_OPEN === '1') return { live: true, configured: false, slug: 'pop-up', name: 'Pop-Up', forced: true };
  const sb = supabaseAdmin();
  if (!sb) return { live: false, configured: false };
  const { data, error } = await sb.from('site_settings').select('value').eq('key', 'popup').maybeSingle();
  if (error) return { live: false, configured: false, error: error.message };
  const v = data?.value || {};
  const open = !!v.live && (!v.ends_at || Date.now() < Date.parse(v.ends_at));
  return {
    live: open, configured: true, slug: v.slug || 'pop-up', name: v.name || 'Pop-Up',
    startedAt: v.started_at || null, endsAt: v.ends_at || null, expired: !!v.live && !open
  };
}

export async function savePopup(value) {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase is not connected');
  const { error } = await sb.from('site_settings').upsert({ key: 'popup', value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export const popupValue = (name, hours) => {
  const now = Date.now();
  const h = Math.min(24, Math.max(1, Number(hours) || 8));
  return { live: true, name: String(name || 'Pop-Up').trim().slice(0, 60) || 'Pop-Up', slug: slugify(name), started_at: new Date(now).toISOString(), ends_at: new Date(now + h * 3600e3).toISOString() };
};

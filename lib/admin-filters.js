// Shared dashboard filters: date range (in Reno time), search text, and URL building.
// Every admin list page reads its filters from the URL, so a filtered view can be bookmarked or shared.

export const TZ = 'America/Los_Angeles';
/** YYYY-MM-DD of a date in Reno time */
export const dayOf = d => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ });
export const addDays = (ymd, n) => { const t = new Date(ymd + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const YMD = /^\d{4}-\d{2}-\d{2}$/;

export const PERIODS = { all: 'All time', today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days', month: 'This month', custom: 'Custom' };

/** ?period=&from=&to=&q= → { period, from, to, q } (from/to are Reno-time days, '' = open) */
export function readFilters(sp = {}) {
  const today = dayOf(Date.now());
  let period = PERIODS[sp.period] ? sp.period : 'all';
  let from = YMD.test(sp.from || '') ? sp.from : '', to = YMD.test(sp.to || '') ? sp.to : '';
  if ((from || to) && !sp.period) period = 'custom';
  if (period === 'today') from = to = today;
  else if (period === '7d') { from = addDays(today, -6); to = today; }
  else if (period === '30d') { from = addDays(today, -29); to = today; }
  else if (period === 'month') { from = today.slice(0, 8) + '01'; to = today; }
  else if (period === 'all') from = to = '';
  if (from && to && from > to) [from, to] = [to, from];
  return { period, from, to, q: String(sp.q || '').trim().slice(0, 80) };
}

/** is this timestamp inside the chosen days? */
export function inRange(date, f) {
  if (!f.from && !f.to) return true;
  if (!date) return false;
  const d = dayOf(date);
  return (!f.from || d >= f.from) && (!f.to || d <= f.to);
}

/** loose UTC bounds (a day either side) for a database query; inRange() then trims to the exact Reno days */
export function dbBounds(f) {
  return {
    gte: f.from ? addDays(f.from, -1) + 'T00:00:00Z' : null,
    lte: f.to ? addDays(f.to, 2) + 'T00:00:00Z' : null
  };
}

/** does the search text appear in any of these values? (phones also match on digits alone) */
export function textMatch(q, values, phones = []) {
  if (!q) return true;
  const needle = q.toLowerCase();
  if (values.filter(Boolean).join(' ').toLowerCase().includes(needle)) return true;
  const digits = q.replace(/\D/g, '');
  return digits.length >= 4 && phones.some(p => String(p || '').replace(/\D/g, '').includes(digits));
}

/**
 * base path + current params with `patch` applied. Values equal to `defaults` (or empty) are left out;
 * from/to are only kept for a custom period.
 */
export function hrefWith(base, cur, patch = {}, defaults = {}) {
  const v = { ...cur, ...patch }, p = new URLSearchParams();
  for (const [k, val] of Object.entries(v)) {
    if (val == null || val === '' || val === defaults[k]) continue;
    if ((k === 'from' || k === 'to') && v.period !== 'custom') continue;
    if (k === 'period' && val === 'all') continue;
    p.set(k, val);
  }
  const s = p.toString();
  return base + (s ? '?' + s : '');
}

/** "Showing 3 of 12 orders · 2026-11-01 → 2026-11-13 · “smith”" */
export function filterNote(f, shown, total, noun, extra = []) {
  const range = f.from ? (f.from === f.to ? f.from : `${f.from} → ${f.to || 'today'}`) : f.to ? `up to ${f.to}` : '';
  return [`Showing ${shown} of ${total} ${noun}${total === 1 ? '' : 's'}`, range, ...extra, f.q ? `“${f.q}”` : ''].filter(Boolean).join(' · ') + '.';
}

/* =========================================================
   Sales tax for live pop-up orders, picked when the pop-up is turned on.
   Pop-up prices are before tax; the guest sees pack + tax = total and pays at the booth.
   These are only the STARTING rates (combined state + county + city, checked Nov 2026).
   Neeks edits them, and adds new locations, from the dashboard (Pop-up orders → Pop-up tax rates);
   the edited list is saved in site_settings ('popup_tax') and wins over this one (lib/popup.js).
   Selling at an event outside Nevada (e.g. Sacramento) needs that state's seller's permit.
   ========================================================= */
export const POPUP_TAX = [
  { id: 'washoe', label: 'Reno / Sparks (Washoe County)', rate: 8.265 },
  { id: 'carson', label: 'Carson City', rate: 7.6 },
  { id: 'lyon', label: 'Dayton / Fernley (Lyon County)', rate: 7.1 },
  { id: 'douglas', label: 'Minden / Gardnerville (Douglas County)', rate: 7.1 },
  { id: 'storey', label: 'Virginia City (Storey County)', rate: 7.6 },
  { id: 'clark', label: 'Las Vegas (Clark County)', rate: 8.375 },
  { id: 'sacramento', label: 'Sacramento, CA (city)', rate: 8.75 },
  { id: 'none', label: 'No sales tax', rate: 0 }
];

export const DEFAULT_POPUP_TAX = 'washoe';

/** a tax % typed in the dashboard → number with up to 3 decimals, or null if it isn't 0–15 */
export const cleanRate = v => {
  if (v === '' || v == null) return null;
  const r = Math.round(Number(v) * 1000) / 1000;
  return Number.isFinite(r) && r >= 0 && r <= 15 ? r : null;
};

/** Resolve the dashboard choice ("washoe", or "custom" + a % typed in) to { label, rate }. `list` = current rates. */
export function popupTaxFrom(id, customRate, list = POPUP_TAX) {
  if (id === 'custom') {
    const r = cleanRate(customRate);
    if (r > 0) return { label: `Custom rate`, rate: r };
  }
  const p = list.find(t => t.id === id) || list.find(t => t.id === DEFAULT_POPUP_TAX) || list[0] || POPUP_TAX[0];
  return { label: p.label, rate: p.rate };
}

/** "$19.99" → 1999 */
export const priceCents = s => Math.round(parseFloat(String(s || '').replace(/[^0-9.]/g, '')) * 100) || 0;
const usd = c => `$${(c / 100).toFixed(2)}`;

/** Pack price + tax, all in cents, plus a one-line description for the board, email and ticket. */
export function withTax(price, rate) {
  const sub = priceCents(price);
  if (!sub) return null;
  const tax = Math.round(sub * (Number(rate) || 0) / 100);
  const total = sub + tax;
  return {
    sub, tax, total,
    line: tax ? `${usd(total)} (${usd(sub)} + ${usd(tax)} tax, ${Number(rate)}%)` : usd(total)
  };
}

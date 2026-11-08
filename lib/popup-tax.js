/* =========================================================
   Sales tax for live pop-up orders, picked when the pop-up is turned on.
   Pop-up prices are before tax; the guest sees pack + tax = total and pays at the booth.
   Rates are combined state + county + city rates (checked Nov 2026). Edit here if they change.
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

/** Resolve the dashboard choice ("washoe", or "custom" + a % typed in) to { label, rate }. */
export function popupTaxFrom(id, customRate) {
  if (id === 'custom') {
    const r = Math.round(Number(customRate) * 1000) / 1000;
    if (r > 0 && r <= 15) return { label: `Custom rate`, rate: r };
  }
  const p = POPUP_TAX.find(t => t.id === id) || POPUP_TAX.find(t => t.id === DEFAULT_POPUP_TAX);
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

/* =========================================================
   NeeksxArt checkout math (single source of truth)
   Used by the checkout page (live breakdown) AND the server (/api/checkout re-checks
   every number, so a tampered browser can't change the price).

   Everything is in cents. Edit the settings below and every page updates.
   ⚠ Demo values: confirm tax rates with an accountant and delivery prices with NeeksxArt
     before switching on real Square payments.
   ========================================================= */
import { PRODUCTS, totalFor, unitFor, isOrderableQty, bundleAt, bundlesFor, singleRange } from './catalog.js';

export const CHECKOUT = {
  // ---- free local delivery (hand-delivered by NeeksxArt) ----
  delivery: {
    label: 'Free local delivery — Reno / Sparks',
    zips: ['89501','89502','89503','89506','89508','89509','89510','89511','89512','89519','89520','89521','89523',
           '89431','89433','89434','89436','89441'],
    note: "If weather, a family emergency or something similar means we can't deliver, we'll ship your order instead and the standard $8.00 shipping fee applies."
  },

  // ---- shipping ----
  shipping: {
    label: 'Flat-rate shipping',
    flatCents: 800,                    // $8 flat rate on orders under $150
    freeOverCents: 15000,              // free on out-of-state orders of $150+ (merchandise subtotal, before tax)
    homeState: 'NV',
    noFreeStates: ['AK', 'HI']         // Alaska and Hawaii are excluded from free shipping
  },

  // ---- sales tax on merchandise (shipping/delivery not taxed here) ----
  tax: {
    zones: [
      { label: 'Washoe County, NV', rate: 0.08265,
        zips: ['89501','89502','89503','89506','89508','89509','89510','89511','89512','89519','89520','89521','89523','89431','89433','89434','89436','89441','89439','89704','89450','89451','89452'] },
      { label: 'Carson City, NV', rate: 0.076, zips: ['89701','89702','89703','89705','89706'] }
    ],
    nevadaDefault: { label: 'Nevada (state minimum)', rate: 0.0685 }    // other NV ZIPs (889xx–898xx)
  },

  // ---- payment ----
  // every online order is paid in full at checkout. Orders of $1,000+ can email us to arrange payment instead.
  largeOrder: { thresholdCents: 100000, email: 'info@neeksxart.com' },
  square: { pct: 0.029, fixedCents: 30, label: 'Square online card fee (2.9% + 30¢)' } // paid by NeeksxArt, not the customer
};

/** one line for product pages, the policy and the footer */
export const SHIPPING_SUMMARY = {
  delivery: 'Free local delivery in Reno & Sparks (if inclement weather or an emergency prevents delivery, the $8 flat-rate shipping fee applies instead)',
  shipping: '$8 flat-rate shipping on orders under $150',
  free: 'Free shipping on out-of-state orders of $150 and over (merchandise subtotal before tax; Alaska & Hawaii excluded)'
};

/** "$1,000" — the large-order amount as people write it */
export const LARGE_ORDER = '$' + (CHECKOUT.largeOrder.thresholdCents / 100).toLocaleString('en-US');

export const cents = d => Math.round(Number(d) * 100);
export const fmt = c => (c < 0 ? '-' : '') + '$' + (Math.abs(c) / 100).toFixed(2);
const pct = r => (r * 100).toFixed(3).replace(/\.?0+$/, '') + '%';
const zip5 = z => String(z || '').replace(/\D/g, '').slice(0, 5);
const isNevadaZip = z => { const n = Number(z); return z.length === 5 && n >= 88900 && n <= 89899; };

export const productById = id => PRODUCTS.find(p => p.id === id);
export const SELLABLE = PRODUCTS.filter(p => !p.special); // special orders (mirrors, Tap-to-Connect) are email-only

export const isLocalZip = zip => CHECKOUT.delivery.zips.includes(zip5(zip));

/** two-letter state from the address, or from the ZIP for AK/HI when the state is blank */
function stateOf(state, zip) {
  const st = String(state || '').trim().toUpperCase().slice(0, 2);
  if (st) return st;
  const n = Number(zip5(zip));
  if (n >= 99500 && n <= 99999) return 'AK';
  if (n >= 96700 && n <= 96899) return 'HI';
  if (isNevadaZip(zip5(zip))) return 'NV';
  return '';
}

function shippingFor(merchCents, state) {
  const S = CHECKOUT.shipping;
  const over = merchCents >= S.freeOverCents;
  const outOfState = state && state !== S.homeState;
  const excluded = S.noFreeStates.includes(state);
  if (over && outOfState && !excluded) {
    return { amount: 0, explain: [`Merchandise subtotal ${fmt(merchCents)} is ${fmt(S.freeOverCents)} or more and ships out of state (${state})`, 'Free shipping'] };
  }
  const why = !over
    ? `Merchandise subtotal ${fmt(merchCents)} is under ${fmt(S.freeOverCents)}`
    : excluded ? `${state === 'AK' ? 'Alaska' : 'Hawaii'} is excluded from free shipping`
      : state === S.homeState ? `Free shipping at ${fmt(S.freeOverCents)} and over is for out-of-state orders (this ships within Nevada)`
        : 'Enter the shipping state to check for free shipping';
  return { amount: S.flatCents, explain: [why, `Flat-rate shipping: ${fmt(S.flatCents)}`] };
}

function taxFor(method, zip) {
  const T = CHECKOUT.tax;
  const z = zip5(zip);
  const zone = T.zones.find(x => x.zips.includes(z));
  if (zone) return { rate: zone.rate, label: zone.label };
  if (isNevadaZip(z)) return { rate: T.nevadaDefault.rate, label: T.nevadaDefault.label };
  return { rate: 0, label: z.length === 5 ? 'Out of state — no Nevada sales tax collected' : 'Enter a ZIP to calculate tax' };
}

/**
 * quote({ items: [{ id, qty }], method: 'delivery'|'shipping', zip, state })
 * → full price breakdown. Throws nothing; problems come back in `errors`.
 */
export function quote({ items = [], method = 'shipping', zip = '', state = '' } = {}) {
  if (method !== 'delivery') method = 'shipping';
  const errors = [];
  const lines = [];
  for (const it of items) {
    const p = productById(it.id);
    const qty = Math.max(1, Math.min(10000, parseInt(it.qty, 10) || 0));
    if (!p) { errors.push(`Unknown product ${it.id}`); continue; }
    if (p.special) { errors.push(`${p.name} is a special order. Email us to order it.`); continue; }
    if (!isOrderableQty(p, qty)) {
      errors.push(`${p.name}: choose ${singleRange(p)} pieces or one of the bundle packs. For other quantities, email or DM us.`);
      continue;
    }
    const totalC = cents(totalFor(p, qty));
    const listUnit = cents(unitFor(p, qty));
    const pack = bundleAt(p, qty);
    const next = bundlesFor(p).find(b => b.qty > qty);
    lines.push({
      id: p.id, name: p.name, qty, totalCents: totalC, unitCents: Math.round(totalC / qty),
      tierUnitCents: listUnit, pack: !!pack,
      tierNote: pack ? `${qty}-pack · ${fmt(listUnit)} each` : `${qty} × ${fmt(listUnit)} (single price)`,
      nextTier: next ? `${next.qty}-pack → ${fmt(cents(next.each))} each` : null
    });
  }
  const subtotal = lines.reduce((a, l) => a + l.totalCents, 0);

  // ---- delivery / shipping ----
  let delivery;
  if (method === 'delivery') {
    const z = zip5(zip);
    if (!z) { errors.push('Enter your ZIP code for delivery.'); delivery = { method, amount: 0, label: CHECKOUT.delivery.label, explain: ['Enter a ZIP code to check local delivery'] }; }
    else if (!isLocalZip(z)) { errors.push('Free local delivery is for Reno and Sparks addresses. Choose shipping instead.'); delivery = { method, amount: 0, label: CHECKOUT.delivery.label, explain: [`ZIP ${z} is outside Reno / Sparks — choose shipping`] }; }
    else delivery = { method, amount: 0, label: CHECKOUT.delivery.label, explain: [`ZIP ${z} is in Reno / Sparks — local delivery is free`, CHECKOUT.delivery.note] };
  } else {
    const st = stateOf(state, zip);
    if (zip5(zip).length !== 5) errors.push('Enter your 5-digit ZIP code for shipping.');
    const s = shippingFor(subtotal, st);
    delivery = { method, amount: s.amount, label: s.amount ? `${CHECKOUT.shipping.label} (${fmt(s.amount)})` : 'Free shipping', explain: s.explain, state: st };
  }

  // ---- tax (merchandise only) ----
  const t = taxFor(method, zip);
  const taxCents = Math.round(subtotal * t.rate);
  const tax = { rate: t.rate, label: t.label, amount: taxCents,
    explain: t.rate ? `${pct(t.rate)} of ${fmt(subtotal)} merchandise (${t.label})` : t.label };

  const total = subtotal + delivery.amount + taxCents;

  // ---- paid in full at checkout (no deposits online) ----
  const dueNow = total;
  const balance = 0;
  const largeOrder = total >= CHECKOUT.largeOrder.thresholdCents;

  // ---- what NeeksxArt keeps (fee is charged on what's paid now) ----
  const fee = dueNow ? Math.round(dueNow * CHECKOUT.square.pct) + CHECKOUT.square.fixedCents : 0;

  return {
    lines, subtotal, delivery, tax, total,
    plan: 'full', largeOrder, dueNow, balance,
    fee: { amount: fee, label: CHECKOUT.square.label },
    net: dueNow - fee,
    errors
  };
}

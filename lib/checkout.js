/* =========================================================
   NeeksxArt checkout math (single source of truth)
   Used by the checkout page (live breakdown) AND the server (/api/checkout re-checks
   every number, so a tampered browser can't change the price).

   Everything is in cents. Edit the settings below and every page updates.
   ⚠ Demo values: confirm tax rates with an accountant and delivery prices with NeeksxArt
     before switching on real Square payments.
   ========================================================= */
import { PRODUCTS, totalFor, unitFor } from './catalog.js';

export const CHECKOUT = {
  // ---- local pickup ----
  pickup: { label: 'Local pickup — Reno', note: "Free. We'll text you when it's ready." },

  // ---- local delivery by ZIP zone (hand-delivered by NeeksxArt) ----
  delivery: {
    freeOverCents: 15000,              // free local delivery on merchandise $150+
    zones: [
      { id: 'A', label: 'Reno / Sparks', feeCents: 799,
        zips: ['89501','89502','89503','89506','89508','89509','89511','89512','89519','89521','89523','89431','89433','89434','89436','89441'] },
      { id: 'B', label: 'Greater Reno area (Carson City, Fernley, Verdi, Washoe Valley, Dayton, Incline)', feeCents: 1499,
        zips: ['89439','89704','89701','89702','89703','89705','89706','89408','89403','89450','89451','89452'] }
    ]
  },

  // ---- shipping (USPS-style, by package weight) ----
  shipping: {
    freeOverCents: 20000,              // free standard shipping on merchandise $200+
    packagingOz: 4,                    // box/mailer + padding
    // [up to oz, price cents] — Ground Advantage style table
    table: [[8, 650], [16, 850], [32, 1150], [80, 1550]],
    perExtraLbCents: 200,              // over the last row: + this per extra pound
    services: [
      { id: 'ground', label: 'USPS Ground Advantage', days: '3–5 business days', extraCents: 0, multiplier: 1 },
      { id: 'priority', label: 'USPS Priority Mail', days: '1–3 business days', extraCents: 600, multiplier: 1 }
    ]
  },

  // ---- sales tax on merchandise (shipping/delivery not taxed here) ----
  tax: {
    zones: [
      { label: 'Washoe County, NV', rate: 0.08265,
        zips: ['89501','89502','89503','89506','89508','89509','89511','89512','89519','89521','89523','89431','89433','89434','89436','89441','89439','89704','89450','89451','89452'] },
      { label: 'Carson City, NV', rate: 0.076, zips: ['89701','89702','89703','89705','89706'] }
    ],
    nevadaDefault: { label: 'Nevada (state minimum)', rate: 0.0685 },   // other NV ZIPs (889xx–898xx)
    pickupZoneLabel: 'Washoe County, NV'                                 // pickup is taxed where the studio is
  },

  // ---- payment ----
  deposit: { thresholdCents: 15000, share: 0.5 },   // policy: $150+ orders may pay a 50% deposit
  square: { pct: 0.029, fixedCents: 30, label: 'Square online card fee (2.9% + 30¢)' }, // paid by NeeksxArt, not the customer

  // estimated product weight in ounces (for shipping)
  weightsOz: { mag25: 0.6, mag225: 0.5, btn1: 0.2, btn225: 0.4, kc15: 0.6, kc225: 0.9, mirror225: 1.2,
               ttc15: 0.7, ttc225: 1.0, ttcmirror: 1.3, pocket3: 1.5 }
};

export const cents = d => Math.round(Number(d) * 100);
export const fmt = c => (c < 0 ? '-' : '') + '$' + (Math.abs(c) / 100).toFixed(2);
const pct = r => (r * 100).toFixed(3).replace(/\.?0+$/, '') + '%';
const zip5 = z => String(z || '').replace(/\D/g, '').slice(0, 5);
const isNevadaZip = z => { const n = Number(z); return z.length === 5 && n >= 88900 && n <= 89899; };

export const productById = id => PRODUCTS.find(p => p.id === id);
export const SELLABLE = PRODUCTS; // every catalog product can be added in the demo

export function deliveryZone(zip) {
  const z = zip5(zip);
  return CHECKOUT.delivery.zones.find(zone => zone.zips.includes(z)) || null;
}

function shippingFor(weightOz, serviceId, merchCents) {
  const S = CHECKOUT.shipping;
  const svc = S.services.find(s => s.id === serviceId) || S.services[0];
  const total = weightOz + S.packagingOz;
  const row = S.table.find(([max]) => total <= max);
  let base, rowText;
  if (row) { base = row[1]; rowText = `up to ${row[0]} oz → ${fmt(row[1])}`; }
  else {
    const [maxOz, maxC] = S.table[S.table.length - 1];
    const extraLb = Math.ceil((total - maxOz) / 16);
    base = maxC + extraLb * S.perExtraLbCents;
    rowText = `${fmt(maxC)} for the first ${maxOz} oz + ${extraLb} extra lb × ${fmt(S.perExtraLbCents)}`;
  }
  const explain = [
    `Package weight: ${weightOz.toFixed(1)} oz of product + ${S.packagingOz} oz packaging = ${total.toFixed(1)} oz`,
    `Rate table: ${rowText}`
  ];
  let amount = Math.round(base * svc.multiplier) + svc.extraCents;
  if (svc.extraCents) explain.push(`${svc.label} upgrade: +${fmt(svc.extraCents)}`);
  if (svc.id === 'ground' && merchCents >= S.freeOverCents) {
    explain.push(`Free standard shipping on orders ${fmt(S.freeOverCents)}+ (saved ${fmt(amount)})`);
    amount = 0;
  }
  return { amount, svc, explain };
}

function taxFor(method, zip) {
  const T = CHECKOUT.tax;
  if (method === 'pickup') {
    const z = T.zones.find(x => x.label === T.pickupZoneLabel);
    return { rate: z.rate, label: `${z.label} (pickup location)` };
  }
  const z = zip5(zip);
  const zone = T.zones.find(x => x.zips.includes(z));
  if (zone) return { rate: zone.rate, label: zone.label };
  if (isNevadaZip(z)) return { rate: T.nevadaDefault.rate, label: T.nevadaDefault.label };
  return { rate: 0, label: z.length === 5 ? 'Out of state — no Nevada sales tax collected' : 'Enter a ZIP to calculate tax' };
}

/**
 * quote({ items: [{ id, qty }], method: 'pickup'|'delivery'|'shipping', zip, service, plan: 'full'|'deposit' })
 * → full price breakdown. Throws nothing; problems come back in `errors`.
 */
export function quote({ items = [], method = 'pickup', zip = '', service = 'ground', plan = 'full' } = {}) {
  const errors = [];
  const lines = [];
  let weightOz = 0;
  for (const it of items) {
    const p = productById(it.id);
    const qty = Math.max(1, Math.min(10000, parseInt(it.qty, 10) || 0));
    if (!p) { errors.push(`Unknown product ${it.id}`); continue; }
    const totalC = cents(totalFor(p, qty));
    const listUnit = cents(unitFor(p, qty));
    const next = p.tiers.find(([m]) => m > qty);
    lines.push({
      id: p.id, name: p.name, qty, totalCents: totalC, unitCents: Math.round(totalC / qty),
      tierUnitCents: listUnit,
      tierNote: totalC < qty * listUnit
        ? `Capped at the next tier price (${fmt(totalC)})`
        : `${fmt(listUnit)} each at ${qty} pcs`,
      nextTier: next ? `${next[0]}+ → ${fmt(cents(next[1]))} each` : null
    });
    weightOz += qty * (CHECKOUT.weightsOz[p.id] ?? 1);
  }
  const subtotal = lines.reduce((a, l) => a + l.totalCents, 0);

  // ---- delivery ----
  let delivery = { method, amount: 0, label: '', explain: [] };
  if (method === 'pickup') {
    delivery = { method, amount: 0, label: CHECKOUT.pickup.label, explain: ['Customer picks up in Reno — no delivery charge'] };
  } else if (method === 'delivery') {
    const zone = deliveryZone(zip);
    if (!zip5(zip)) { delivery = { method, amount: 0, label: 'Local delivery', explain: ['Enter a ZIP code to check delivery'] }; errors.push('Enter your ZIP code for delivery.'); }
    else if (!zone) { delivery = { method, amount: 0, label: 'Local delivery', explain: [`ZIP ${zip5(zip)} is outside our delivery area — choose shipping instead`] }; errors.push('That ZIP is outside our local delivery area. Choose shipping instead.'); }
    else {
      const free = subtotal >= CHECKOUT.delivery.freeOverCents;
      delivery = {
        method, amount: free ? 0 : zone.feeCents, label: `Local delivery — Zone ${zone.id}`,
        explain: [`ZIP ${zip5(zip)} is in Zone ${zone.id}: ${zone.label}`, `Zone ${zone.id} delivery fee: ${fmt(zone.feeCents)}`,
          ...(free ? [`Free local delivery on orders ${fmt(CHECKOUT.delivery.freeOverCents)}+ (saved ${fmt(zone.feeCents)})`] : [`Free delivery unlocks at ${fmt(CHECKOUT.delivery.freeOverCents)} (${fmt(CHECKOUT.delivery.freeOverCents - subtotal)} away)`])]
      };
    }
  } else if (method === 'shipping') {
    if (zip5(zip).length !== 5) errors.push('Enter your 5-digit ZIP code for shipping.');
    const s = shippingFor(weightOz, service, subtotal);
    delivery = { method, amount: s.amount, label: `${s.svc.label} (${s.svc.days})`, explain: s.explain, service: s.svc.id };
  }

  // ---- tax (merchandise only) ----
  const t = taxFor(method, zip);
  const taxCents = Math.round(subtotal * t.rate);
  const tax = { rate: t.rate, label: t.label, amount: taxCents,
    explain: t.rate ? `${pct(t.rate)} of ${fmt(subtotal)} merchandise (${t.label})` : t.label };

  const total = subtotal + delivery.amount + taxCents;

  // ---- deposit ----
  const depositAllowed = total >= CHECKOUT.deposit.thresholdCents;
  const usePlan = depositAllowed && plan === 'deposit' ? 'deposit' : 'full';
  const dueNow = usePlan === 'deposit' ? Math.round(total * CHECKOUT.deposit.share) : total;
  const balance = total - dueNow;

  // ---- what NeeksxArt keeps (fee is charged on what's paid now) ----
  const fee = dueNow ? Math.round(dueNow * CHECKOUT.square.pct) + CHECKOUT.square.fixedCents : 0;

  return {
    lines, weightOz: Math.round(weightOz * 10) / 10, subtotal, delivery, tax, total,
    plan: usePlan, depositAllowed, dueNow, balance,
    fee: { amount: fee, label: CHECKOUT.square.label },
    net: dueNow - fee,
    errors
  };
}

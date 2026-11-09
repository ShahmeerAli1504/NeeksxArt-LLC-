'use client';
// Quantity chooser for online orders: the single price (e.g. 1–9 pieces) or one bundle pack.
// Bundles are sold only at their exact quantity; anything else is an email / DM order.
import { money, singleTier, bundlesFor, bundleAt } from '@/lib/catalog';

/** variant="chips" (catalog, pricing) or "select" (compact, checkout lines) */
export default function QtyPicker({ product: p, value, onChange, variant = 'chips', label }) {
  const single = singleTier(p);
  const bundles = bundlesFor(p);
  const isPack = !!bundleAt(p, value);
  const singleQty = isPack ? 1 : Math.min(single.max, Math.max(1, value || 1));

  if (variant === 'select') {
    return (
      <select className="qp-select" value={value} aria-label={label || `Quantity of ${p.name}`} onChange={e => onChange(parseInt(e.target.value, 10))}>
        <optgroup label={`Single price · ${money(single.each)} each`}>
          {Array.from({ length: single.max }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} × {money(single.each)} = {money(n * single.each)}</option>
          ))}
        </optgroup>
        {bundles.length > 0 && (
          <optgroup label="Bundle packs">
            {bundles.map(b => <option key={b.qty} value={b.qty}>{b.qty}-pack · {money(b.price)} ({money(b.each)} each)</option>)}
          </optgroup>
        )}
      </select>
    );
  }

  return (
    <div className="qp" role="group" aria-label={label || `Quantity for ${p.name}`}>
      <div className="qp-chips">
        <button type="button" className={!isPack ? 'on' : ''} aria-pressed={!isPack} onClick={() => onChange(singleQty)}>
          <b>Single</b><small>{money(single.each)} each</small>
        </button>
        {bundles.map(b => (
          <button type="button" key={b.qty} className={value === b.qty ? 'on' : ''} aria-pressed={value === b.qty} onClick={() => onChange(b.qty)}>
            <b>{b.qty}-pack</b><small>{money(b.price)}</small>
          </button>
        ))}
      </div>
      {!isPack && single.max > 1 && (
        <label className="atc-qty qp-step">
          <span className="sr-only">How many singles</span>
          <button type="button" aria-label="Fewer" disabled={singleQty <= 1} onClick={() => onChange(singleQty - 1)}>−</button>
          <output>{singleQty}</output>
          <button type="button" aria-label="More" disabled={singleQty >= single.max} onClick={() => onChange(singleQty + 1)}>+</button>
          <small>up to {single.max}</small>
        </label>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addToCart } from '@/lib/cart';
import { productById } from '@/lib/checkout';
import { money, totalFor } from '@/lib/catalog';

/** quantity + "Add to cart" for a catalog product; `compact` hides the live price line */
export default function AddToCart({ id, defaultQty = 10, compact = false }) {
  const p = productById(id);
  const [qty, setQty] = useState(String(defaultQty));
  const [added, setAdded] = useState(false);
  if (!p) return null;
  const q = Math.max(1, Math.min(10000, parseInt(qty, 10) || 1));

  return (
    <div className="atc">
      <div className="atc-row">
        <label className="atc-qty">
          <span className="sr-only">Quantity</span>
          <button type="button" aria-label="Fewer" onClick={() => setQty(String(Math.max(1, q - 1)))}>−</button>
          <input type="number" min="1" max="10000" inputMode="numeric" value={qty} onChange={e => { setQty(e.target.value); setAdded(false); }} />
          <button type="button" aria-label="More" onClick={() => setQty(String(q + 1))}>+</button>
        </label>
        <button type="button" className="btn btn-ink atc-btn" onClick={() => { addToCart(p.id, q); setAdded(true); }}>
          Add to cart
        </button>
      </div>
      {!compact && <small className="atc-price">{q} × {money(totalFor(p, q) / q)} = <b>{money(totalFor(p, q))}</b></small>}
      {added && <small className="atc-added">Added ✓ <Link href="/checkout">Go to checkout →</Link></small>}
    </div>
  );
}

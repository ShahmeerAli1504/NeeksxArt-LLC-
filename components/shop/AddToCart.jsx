'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addToCart } from '@/lib/cart';
import { productById } from '@/lib/checkout';
import { money, totalFor, qtyLabel, EMAIL } from '@/lib/catalog';
import QtyPicker from './QtyPicker';

/** single / bundle-pack picker + "Add to cart" for a catalog product; `compact` hides the live price line */
export default function AddToCart({ id, defaultQty = 1, compact = false }) {
  const p = productById(id);
  const [qty, setQty] = useState(defaultQty);
  const [added, setAdded] = useState(false);
  if (!p) return null;

  return (
    <div className="atc">
      <QtyPicker product={p} value={qty} onChange={q => { setQty(q); setAdded(false); }} />
      <div className="atc-row">
        {!compact && <small className="atc-price">{qtyLabel(p, qty)} = <b>{money(totalFor(p, qty))}</b> <span className="plus-tax">+ tax</span></small>}
        <button type="button" className="btn btn-ink atc-btn" onClick={() => { addToCart(p.id, qty); setAdded(true); }}>
          Add to cart
        </button>
      </div>
      {added && <small className="atc-added">Added ✓ <Link href="/checkout">Go to checkout →</Link></small>}
      <small className="atc-other">Need a different quantity? <a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Custom quantity: ' + p.name)}`}>Email</a> or DM us.</small>
    </div>
  );
}

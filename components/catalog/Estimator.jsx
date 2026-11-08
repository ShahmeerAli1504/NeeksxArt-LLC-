'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, pics, money, totalFor, mailto } from '@/lib/catalog';
import { Arrow } from '@/components/icons';
import { addToCart } from '@/lib/cart';

const QUICK = [1, 10, 25, 50, 100, 250];
const clamp = v => Math.max(1, Math.min(10000, parseInt(v, 10) || 1));

export default function Estimator({ className, ...rest }) {
  const [id, setId] = useState(PRODUCTS[0].id);
  const [qty, setQty] = useState('25');
  const [added, setAdded] = useState('');

  // preselect from /pricing?p=<id>
  useEffect(() => {
    const pre = new URLSearchParams(window.location.search).get('p');
    if (pre && PRODUCTS.some(p => p.id === pre)) setId(pre);
  }, []);

  const p = PRODUCTS.find(x => x.id === id);
  const q = clamp(qty);
  const total = totalFor(p, q);
  const next = p.tiers.find(([m]) => m > q);

  return (
    <div className={className} {...rest}>
      <div className="est-grid">
        <div className="est-controls">
          <div className="field">
            <label htmlFor="estP">Product</label>
            <select id="estP" value={id} onChange={e => setId(e.target.value)}>
              {PRODUCTS.map(x => (
                <option key={x.id} value={x.id}>{x.name}{x.special ? ' (special order)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="estQ">Quantity</label>
            <div className="qty">
              <button type="button" aria-label="Fewer" onClick={() => setQty(String(Math.max(1, q - 1)))}>−</button>
              <input id="estQ" type="number" min="1" max="10000" inputMode="numeric" value={qty} onChange={e => setQty(e.target.value)} />
              <button type="button" aria-label="More" onClick={() => setQty(String(q + 1))}>+</button>
            </div>
            <div className="qty-quick">
              {QUICK.map(n => (
                <button type="button" key={n} onClick={() => setQty(String(n))}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="est-out">
          <img src={pics(p)[0]} alt="" />
          <small>Estimated subtotal</small>
          <div className="est-total">{money(total)}</div>
          <p>{q} × {p.name} · {money(total / q)} each</p>
          <p className="est-next">
            {next ? `Order ${next[0]} and the price drops to ${money(next[1])} each.` : "You're at our best price per piece."}
          </p>
          {p.special ? (
            <a className="btn btn-orange" href={mailto(p, q)}>Email to order <Arrow /></a>
          ) : (
            <div className="est-btns">
              <button type="button" className="btn btn-orange" onClick={() => { addToCart(p.id, q); setAdded(`${q} added`); }}>Add to cart <Arrow /></button>
              <Link className="btn btn-ghost" href={`/studio?product=${p.studio}`}>Design it</Link>
            </div>
          )}
          {added && !p.special && <small className="est-added">{added} ✓ <Link href="/checkout">Checkout →</Link></small>}
          <small className="est-fine">Before tax and shipping. Free local delivery in Reno &amp; Sparks (the $8 shipping fee applies if weather or an emergency prevents delivery) · $8 flat-rate shipping under $150 · free shipping out of state over $150.</small>
        </div>
      </div>
    </div>
  );
}

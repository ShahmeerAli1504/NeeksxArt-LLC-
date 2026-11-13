'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, pics, money, totalFor, requestLink, bundlesFor, bundleAt, qtyLabel } from '@/lib/catalog';
import { Arrow } from '@/components/icons';
import { addToCart } from '@/lib/cart';
import QtyPicker from '@/components/shop/QtyPicker';

const firstPack = p => bundlesFor(p)[0]?.qty || 1;

export default function Estimator({ className, ...rest }) {
  const [id, setId] = useState(PRODUCTS[0].id);
  const [qty, setQty] = useState(firstPack(PRODUCTS[0]));
  const [added, setAdded] = useState('');

  // preselect from /pricing?p=<id>
  useEffect(() => {
    const pre = PRODUCTS.find(p => p.id === new URLSearchParams(window.location.search).get('p'));
    if (pre) { setId(pre.id); setQty(firstPack(pre)); }
  }, []);

  const p = PRODUCTS.find(x => x.id === id);
  const total = totalFor(p, qty);
  const pack = bundleAt(p, qty);
  const next = bundlesFor(p).find(b => b.qty > qty);

  return (
    <div className={className} {...rest}>
      <div className="est-grid">
        <div className="est-controls">
          <div className="field">
            <label htmlFor="estP">Product</label>
            <select id="estP" value={id} onChange={e => { const np = PRODUCTS.find(x => x.id === e.target.value); setId(np.id); setQty(firstPack(np)); setAdded(''); }}>
              {PRODUCTS.map(x => (
                <option key={x.id} value={x.id}>{x.name}{x.special ? ' (special order)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Single or bundle pack</label>
            <QtyPicker product={p} value={qty} onChange={q => { setQty(q); setAdded(''); }} />
            <small className="est-other">Need a quantity that isn&apos;t a bundle? <Link href={requestLink(p)}>Send a request</Link> or DM us.</small>
          </div>
        </div>
        <div className="est-out">
          <img src={pics(p)[0]} alt="" />
          <small>{pack ? 'Bundle price' : 'Single price'}</small>
          <div className="est-total">{money(total)} <span className="est-tax">+ tax</span></div>
          <p>{qtyLabel(p, qty)} · {p.name} · {money(total / qty)} each</p>
          <p className="est-next">
            {next ? `The ${next.qty}-pack brings it to ${money(next.each)} each.` : "You're at our best price per piece."}
          </p>
          {p.special ? (
            <Link className="btn btn-orange" href={requestLink(p, qty)}>Request to order <Arrow /></Link>
          ) : (
            <div className="est-btns">
              <button type="button" className="btn btn-orange" onClick={() => { addToCart(p.id, qty); setAdded(`${qtyLabel(p, qty)} added`); }}>Add to cart <Arrow /></button>
              <Link className="btn btn-ghost" href={`/studio?item=${p.id}`}>Design it</Link>
            </div>
          )}
          {added && !p.special && <small className="est-added">{added} ✓ <Link href="/checkout">Checkout →</Link></small>}
          <small className="est-fine">Prices are before sales tax and shipping; tax is added at checkout from your ZIP. Free local delivery in Reno &amp; Sparks (the $8 shipping fee applies if weather or an emergency prevents delivery) · $8 flat-rate shipping under $150 · free shipping out of state on $150 and over.</small>
        </div>
      </div>
    </div>
  );
}

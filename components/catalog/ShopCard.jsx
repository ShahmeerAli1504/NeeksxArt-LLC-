'use client';

import { useState } from 'react';
import Link from 'next/link';
import { pics, thumbs, money, mailto } from '@/lib/catalog';
import { Arrow } from '@/components/icons';
import TierTable from './TierTable';
import AddToCart from '@/components/shop/AddToCart';

export default function ShopCard({ product: p }) {
  const big = pics(p);
  const small = thumbs(p);
  const [on, setOn] = useState(0);

  return (
    <article className="shop-card reveal" id={p.id}>
      {p.special
        ? <span className="tag special">Special order</span>
        : p.tag ? <span className="tag hot">{p.tag}</span> : <span className="tag">No minimum</span>}
      <div className="shop-media"><img src={big[on]} alt={p.name} loading="lazy" /></div>
      {big.length > 1 && (
        <div className="shop-thumbs">
          {small.map((s, i) => (
            <button type="button" key={s} className={i === on ? 'on' : ''} onClick={() => setOn(i)} aria-label={`Photo ${i + 1} of ${p.name}`}>
              <img src={s} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="shop-body">
        <small className="shop-group">{p.group} · {p.short}</small>
        <h3>{p.name}</h3>
        <p className="shop-from">
          From <strong>{money(p.tiers[p.tiers.length - 1][1])}</strong> <span>to {money(p.tiers[0][1])} each</span>
        </p>
        <p>{p.desc}</p>
        <details>
          <summary>Quantity pricing</summary>
          <TierTable product={p} />
        </details>
        {!p.special && <AddToCart id={p.id} defaultQty={p.tiers[1]?.[0] || 10} />}
        <div className="shop-ctas">
          {p.special ? (
            <>
              <a className="btn btn-orange" href={mailto(p)}>Email to order <Arrow /></a>
              <Link className="link-arrow" href={`/studio?product=${p.studio}`}>Preview it</Link>
            </>
          ) : (
            <>
              <Link className="btn btn-orange" href={`/studio?product=${p.studio}`}>Design yours <Arrow /></Link>
              <Link className="link-arrow" href={`/pricing?p=${p.id}#estimate`}>Estimate</Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

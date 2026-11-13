'use client';

import { useState } from 'react';
import Link from 'next/link';
import { pics, thumbs, money, requestLink, bundlesFor } from '@/lib/catalog';
import { Arrow } from '@/components/icons';
import TierTable from './TierTable';
import AddToCart from '@/components/shop/AddToCart';

export default function ShopCard({ product: p, photos }) {
  const big = photos?.big?.length ? photos.big : pics(p);
  const small = photos?.small?.length ? photos.small : thumbs(p);
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
          From <strong>{money(p.tiers[0][1])}</strong> <span>each + tax · bundle packs save more</span>
        </p>
        <p>{p.desc}</p>
        <details>
          <summary>Single &amp; bundle pricing</summary>
          <TierTable product={p} />
        </details>
        {!p.special && <AddToCart id={p.id} defaultQty={bundlesFor(p)[0]?.qty || 1} />}
        <div className="shop-ctas">
          {p.special ? (
            <>
              <Link className="btn btn-orange" href={requestLink(p)}>Request to order <Arrow /></Link>
              <Link className="link-arrow" href={`/studio?item=${p.id}`}>Preview it</Link>
            </>
          ) : (
            <>
              <Link className="btn btn-orange" href={`/studio?item=${p.id}`}>Design yours <Arrow /></Link>
              <Link className="link-arrow" href={`/pricing?p=${p.id}#estimate`}>Estimate</Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartLink({ onClick }) {
  const { items, ready } = useCart();
  const count = items.reduce((a, i) => a + i.qty, 0);
  return (
    <Link href="/checkout" className="cart-link" onClick={onClick} aria-label={`Cart${ready && count ? `, ${count} items` : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
      </svg>
      <span className="cart-label">Cart</span>
      {ready && count > 0 && <span className="cart-count">{count > 999 ? '999+' : count}</span>}
    </Link>
  );
}

import Link from 'next/link';
import { SHIPPING_SUMMARY } from '@/lib/checkout';

/** Shipping & local delivery terms — one place, shown on product pages, pricing and the policy */
export default function ShippingNote({ className = '', policyLink = true }) {
  return (
    <div className={`ship-note ${className}`} role="note">
      <b>Shipping &amp; local delivery</b>
      <ul>
        <li>{SHIPPING_SUMMARY.delivery}</li>
        <li>{SHIPPING_SUMMARY.shipping}</li>
        <li>{SHIPPING_SUMMARY.free}</li>
        <li>{SHIPPING_SUMMARY.time}</li>
      </ul>
      {policyLink && <Link href="/policy#shipping">Shipping details →</Link>}
    </div>
  );
}

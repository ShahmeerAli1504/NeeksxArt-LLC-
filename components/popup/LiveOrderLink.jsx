import Link from 'next/link';
import { getPopup } from '@/lib/popup';

/**
 * "Order live" button that only exists while Live Magnets ordering is switched ON in the dashboard,
 * so online shoppers never land on the (pricier) pop-up order page by accident.
 * children can be a function: popup => label
 */
export default async function LiveOrderLink({ children, fallback = null, ...props }) {
  const p = await getPopup();
  if (!p.live) return fallback;
  return <Link href="/event" {...props}>{typeof children === 'function' ? children(p) : children}</Link>;
}

export async function LiveOnly({ children, fallback = null }) {
  const p = await getPopup();
  return p.live ? (typeof children === 'function' ? children(p) : children) : fallback;
}

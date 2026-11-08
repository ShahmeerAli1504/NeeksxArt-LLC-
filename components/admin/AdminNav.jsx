import Link from 'next/link';
import { logout } from '@/lib/admin-actions';
import LiveStatus from '@/components/admin/LiveStatus';

export default function AdminNav({ active }) {
  return (
    <header className="adm-top">
      <Link href="/admin" className="adm-brand"><img src="/brand/neeksxart-logo-white.png" alt="Neeks Art" /> Dashboard</Link>
      <LiveStatus />
      <nav>
        <Link href="/admin" className={active === 'orders' ? 'on' : ''}>Pop-up orders</Link>
        <Link href="/admin/inquiries" className={active === 'inquiries' ? 'on' : ''}>Inquiries</Link>
        <Link href="/admin/products" className={active === 'products' ? 'on' : ''}>Product photos</Link>
        <Link href="/admin/reviews" className={active === 'reviews' ? 'on' : ''}>Reviews</Link>
        <Link href="/admin/payments" className={active === 'payments' ? 'on' : ''}>Payments</Link>
        <Link href="/admin/templates" className={active === 'templates' ? 'on' : ''}>Templates</Link>
        <Link href="/booth" target="_blank">Booth poster ↗</Link>
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logout}><button type="submit">Log out</button></form>
      </nav>
    </header>
  );
}

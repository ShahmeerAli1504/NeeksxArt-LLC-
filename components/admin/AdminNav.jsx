import Link from 'next/link';
import { logout } from '@/lib/admin-actions';
import { media } from '@/lib/media';

export default function AdminNav({ active }) {
  return (
    <header className="adm-top">
      <Link href="/admin" className="adm-brand"><img src={media('img/logo-white.png')} alt="NeeksxArt" /> Dashboard</Link>
      <nav>
        <Link href="/admin" className={active === 'orders' ? 'on' : ''}>Pop-up orders</Link>
        <Link href="/admin/inquiries" className={active === 'inquiries' ? 'on' : ''}>Inquiries</Link>
        <Link href="/booth" target="_blank">Booth poster ↗</Link>
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logout}><button type="submit">Log out</button></form>
      </nav>
    </header>
  );
}

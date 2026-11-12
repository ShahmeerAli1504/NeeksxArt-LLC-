import Link from 'next/link';
import { logout } from '@/lib/admin-actions';
import LiveStatus from '@/components/admin/LiveStatus';
import AdminTabs from '@/components/admin/AdminTabs';
import { adminCounts } from '@/lib/admin-counts';

export default async function AdminNav({ active }) {
  const counts = await adminCounts();
  return (
    <header className="adm-top">
      <Link href="/admin" className="adm-brand"><img src="/brand/neeksxart-logo-white.png" alt="Neeks Art" /> Dashboard</Link>
      <LiveStatus />
      <nav>
        <AdminTabs active={active} initial={counts} />
        <Link href="/booth" target="_blank">Booth poster ↗</Link>
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logout}><button type="submit">Log out</button></form>
      </nav>
    </header>
  );
}

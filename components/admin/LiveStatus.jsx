import Link from 'next/link';
import { getPopup } from '@/lib/popup';

/** Live Magnets ON/OFF badge in the dashboard header, on every admin page. */
export default async function LiveStatus() {
  const p = await getPopup();
  return (
    <Link href="/admin#live-switch" className={`adm-live${p.live ? ' on' : ''}`} title="Live Magnets ordering switch">
      <i /> Live Magnets {p.live ? 'ON' : 'OFF'}
    </Link>
  );
}

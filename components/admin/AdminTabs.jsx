'use client';
// Dashboard tabs with a badge for anything waiting (new pop-up orders, inquiries, reviews, online orders).
// Checks every 30 seconds, so a new order shows up without reloading; the browser tab title gets the total too.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  ['orders', '/admin', 'Pop-up orders'],
  ['inquiries', '/admin/inquiries', 'Inquiries'],
  ['products', '/admin/products', 'Product photos'],
  ['reviews', '/admin/reviews', 'Reviews'],
  ['payments', '/admin/payments', 'Payments'],
  ['templates', '/admin/templates', 'Templates']
];
const LABEL = { orders: 'new pop-up orders', inquiries: 'new inquiries', reviews: 'reviews to approve', payments: 'new online orders' };

export default function AdminTabs({ initial }) {
  const [counts, setCounts] = useState(initial || {});
  const router = useRouter();
  const path = usePathname();
  const active = (TABS.find(([, href]) => href !== '/admin' && path.startsWith(href)) || TABS[0])[0];
  const last = useRef(initial || {});

  useEffect(() => {
    let stop = false;
    const check = async () => {
      try {
        const r = await fetch('/api/admin/counts', { cache: 'no-store' });
        const out = await r.json();
        if (stop || !out.ok) return;
        // something new arrived for the page being looked at: refresh it so the new row shows
        if ((out.counts[active] || 0) > (last.current[active] || 0)) router.refresh();
        last.current = out.counts;
        setCounts(out.counts);
      } catch { /* offline for a moment */ }
    };
    const t = setInterval(check, 30000);
    const onFocus = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onFocus);
    return () => { stop = true; clearInterval(t); document.removeEventListener('visibilitychange', onFocus); };
  }, [active, router]);

  const total = Object.values(counts).reduce((a, n) => a + (n || 0), 0);
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = total ? `(${total}) ${base}` : base;
  }, [total]);

  return TABS.map(([key, href, label]) => {
    const n = counts[key] || 0;
    return (
      <Link key={key} href={href} className={active === key ? 'on' : ''}>
        {label}
        {n > 0 && <span className="adm-badge" title={`${n} ${LABEL[key]}`} aria-label={`${n} ${LABEL[key]}`}>{n > 99 ? '99+' : n}</span>}
      </Link>
    );
  });
}

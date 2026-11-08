'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { media } from '@/lib/media';
import { Arrow } from '@/components/icons';
import CartLink from '@/components/shop/CartLink';

const NAV = [
  ['/', 'Home'],
  ['/magnets', 'Standard Custom Magnets'],
  ['/catalog', 'Catalog'],
  ['/favors', 'Events & Party Favors'],
  ['/pricing', 'Estimate Pricing'],
  ['/story', 'About Us'],
  ['/contact', 'Contact']
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const cls = ['site-header', scrolled && 'scrolled', open && 'menu-open'].filter(Boolean).join(' ');

  return (
    <header className={cls}>
      <nav className="wrap nav" aria-label="Main">
        <Link href="/" className="brand" aria-label="NeeksxArt home">
          <img src={media('img/logo-white.png')} alt="NeeksxArt" width="768" height="551" />
        </Link>
        <div className={'nav-links' + (open ? ' open' : '')} id="nav-links">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <CartLink onClick={() => setOpen(false)} />
          <Link href="/studio" className="btn btn-orange" onClick={() => setOpen(false)}>
            Free Mockup <Arrow />
          </Link>
        </div>
        <button
          type="button"
          className="burger"
          aria-label="Open menu"
          aria-controls="nav-links"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

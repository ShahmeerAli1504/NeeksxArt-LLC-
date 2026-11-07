'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Shared page behaviour (ported from the old js/site.js):
 * reveal-on-scroll, play videos only while visible, lightbox, portfolio filters.
 * Runs once per route and also picks up elements rendered later (MutationObserver).
 */
export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const hasIO = 'IntersectionObserver' in window;
    const revealIO = hasIO
      ? new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
      : null;
    const videoIO = hasIO
      ? new IntersectionObserver(entries => {
          entries.forEach(e => {
            const v = e.target;
            if (e.isIntersecting) v.play().catch(() => {});
            else v.pause();
          });
        }, { threshold: 0.25 })
      : null;

    const seen = new WeakSet();
    const scan = root => {
      root.querySelectorAll?.('.reveal:not(.in)').forEach(el => {
        if (seen.has(el)) return; seen.add(el);
        revealIO ? revealIO.observe(el) : el.classList.add('in');
      });
      root.querySelectorAll?.('video[data-autoplay]').forEach(v => {
        if (seen.has(v)) return; seen.add(v);
        v.muted = true; // React doesn't always render the muted attribute; iOS needs it to autoplay
        videoIO ? videoIO.observe(v) : v.play().catch(() => {});
      });
    };
    scan(document);
    const mo = new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && scan(n.parentNode || n))));
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { mo.disconnect(); revealIO?.disconnect(); videoIO?.disconnect(); };
  }, [pathname]);

  // lightbox + gallery filters (event delegation, set up once)
  useEffect(() => {
    const lb = document.querySelector('.lightbox');
    const lbImg = lb?.querySelector('img');
    const close = () => lb?.classList.remove('open');

    const onClick = e => {
      const fig = e.target.closest('[data-lightbox]');
      if (fig && lb) {
        const src = fig.querySelector('img');
        if (src) { lbImg.src = src.currentSrc || src.src; lbImg.alt = src.alt; lb.classList.add('open'); }
        return;
      }
      if (lb && e.target.closest('.lightbox') && (e.target === lb || e.target.closest('button'))) { close(); return; }

      const btn = e.target.closest('.filters button');
      if (btn) {
        const filters = btn.closest('.filters');
        filters.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === btn));
        const f = btn.dataset.filter;
        document.querySelectorAll('.masonry figure').forEach(fig2 => {
          fig2.classList.toggle('hide', f !== 'all' && !(fig2.dataset.cat || '').split(' ').includes(f));
        });
      }
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  return null;
}

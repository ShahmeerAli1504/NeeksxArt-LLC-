'use client';

import { useEffect } from 'react';

// The interactive tools (canvas mockups, photo cropping, booth QR) are framework-free modules
// that wire themselves to the markup rendered by the page. Each exports init() → cleanup().
const MODULES = {
  studio: () => import('@/lib/legacy/studio'),
  event: () => import('@/lib/legacy/event'),
  booth: () => import('@/lib/legacy/booth'),
  contact: () => import('@/lib/legacy/contact'),
  quote: () => import('@/lib/legacy/quote')
};

export default function LegacyMount({ module }) {
  useEffect(() => {
    let cleanup, cancelled = false;
    MODULES[module]().then(m => {
      if (!cancelled) cleanup = m.init();
    });
    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, [module]);
  return null;
}

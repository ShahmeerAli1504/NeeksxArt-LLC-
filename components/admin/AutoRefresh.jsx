'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Re-fetches the server-rendered dashboard so new pop-up orders appear on their own. */
export default function AutoRefresh({ seconds = 20 }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}

'use client';
// The discount code running right now, read in the browser after the page loads.
// (Catalog pages can be prerendered, so the sale dates are checked against the visitor's clock, not build time.)
import { useEffect, useState } from 'react';
import { activePromo } from '@/lib/checkout';

export default function usePromo() {
  const [promo, setPromo] = useState(null);
  useEffect(() => { setPromo(activePromo()); }, []);
  return promo;
}

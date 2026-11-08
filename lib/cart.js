'use client';
// Shopping cart kept in this browser (localStorage). Items: [{ id, qty }].
// Prices are never stored here: the checkout recalculates them from lib/catalog.js.
import { useEffect, useState } from 'react';

const KEY = 'neeksCart';
const EVT = 'neeks-cart';

export function readCart() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter(i => i && i.id && i.qty > 0) : [];
  } catch { return []; }
}
export function writeCart(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode: cart lives for this page only */ }
  window.dispatchEvent(new CustomEvent(EVT, { detail: items }));
}
export function addToCart(id, qty) {
  const items = readCart();
  const hit = items.find(i => i.id === id);
  if (hit) hit.qty = Math.min(10000, hit.qty + qty); else items.push({ id, qty });
  writeCart(items);
}
export function setQty(id, qty) {
  writeCart(readCart().map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(10000, qty)) } : i));
}
export const removeFromCart = id => writeCart(readCart().filter(i => i.id !== id));
export const clearCart = () => writeCart([]);

/** live cart for components; `ready` is false until the browser copy is read (avoids SSR mismatch) */
export function useCart() {
  const [state, setState] = useState({ items: [], ready: false });
  useEffect(() => {
    const sync = () => setState({ items: readCart(), ready: true });
    sync();
    const onStorage = e => { if (e.key === KEY) sync(); };
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', onStorage); };
  }, []);
  return state;
}

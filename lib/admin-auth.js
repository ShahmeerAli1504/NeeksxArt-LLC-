import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'nx_admin';

const sessionValue = () => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac('sha256', pw).update('neeksxart-admin-v1').digest('hex');
};

export function checkPassword(input) {
  const pw = process.env.ADMIN_PASSWORD || '';
  if (!pw) return false;
  const a = Buffer.from(String(input || '')), b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const want = sessionValue();
  if (!want) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === want;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

export async function startSession() {
  const jar = await cookies();
  jar.set(COOKIE, sessionValue(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

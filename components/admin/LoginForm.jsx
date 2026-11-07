'use client';

import { useActionState } from 'react';
import { login } from '@/lib/admin-actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="adm-login">
      <label htmlFor="pw">Dashboard password</label>
      <input id="pw" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state?.error && <p className="adm-err">{state.error}</p>}
      <button className="btn btn-orange" type="submit" disabled={pending}>{pending ? 'Checking…' : 'Log in'}</button>
    </form>
  );
}

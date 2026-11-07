import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import LoginForm from '@/components/admin/LoginForm';
import { media } from '@/lib/media';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <div className="adm-login-wrap">
      <img src={media('img/logo-white.png')} alt="NeeksxArt" />
      <h1>Staff dashboard</h1>
      <p>Pop-up orders and website inquiries.</p>
      <LoginForm />
    </div>
  );
}

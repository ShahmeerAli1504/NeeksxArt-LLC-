// Every signed-in dashboard page shares this top bar. It lives in the layout so it renders once and stays
// on screen while you switch tabs: only the page below it reloads. (The login page sits outside this group.)
import { requireAdmin } from '@/lib/admin-auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function PanelLayout({ children }) {
  await requireAdmin();
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}

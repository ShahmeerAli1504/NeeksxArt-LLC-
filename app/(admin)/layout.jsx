export const metadata = {
  title: 'NeeksxArt Dashboard',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  return <div className="adm">{children}</div>;
}

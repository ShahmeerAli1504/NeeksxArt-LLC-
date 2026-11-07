import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteEffects from '@/components/SiteEffects';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <div className="lightbox" role="dialog" aria-label="Image viewer">
        <button type="button" aria-label="Close">×</button>
        <img alt="" />
      </div>
      <SiteEffects />
    </>
  );
}

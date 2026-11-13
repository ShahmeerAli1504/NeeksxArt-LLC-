import { requireAdmin } from '@/lib/admin-auth';
import { PRODUCTS } from '@/lib/catalog';
import { getProductPhotos, SLOTS } from '@/lib/product-photos';
import { supabaseAdmin } from '@/lib/supabase/admin';
import PhotoSlot from '@/components/admin/PhotoSlot';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  await requireAdmin();
  const photos = await getProductPhotos();
  const connected = !!supabaseAdmin();
  const short = PRODUCTS.filter(p => photos[p.id].missing > 0);

  return (
    <>
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Product photos</h1>
            <p>Every product shows exactly {SLOTS} photos. Replace any slot whenever you like; the shop updates right away. Photo 1 is the main one.</p>
          </div>
        </div>
        {!connected && <p className="pay-warn">Supabase isn&apos;t connected yet, so photos can&apos;t be uploaded. Add the keys from README → Supabase setup.</p>}
        {short.length > 0 && (
          <p className="pay-warn">{short.length} product{short.length > 1 ? 's need' : ' needs'} more photos to reach {SLOTS}: {short.map(p => `${p.name} (${SLOTS - photos[p.id].missing}/${SLOTS})`).join(' · ')}</p>
        )}
        <div className="ph-list">
          {PRODUCTS.map(p => {
            const ph = photos[p.id];
            return (
              <section key={p.id} className="ph-product">
                <header>
                  <h2>{p.name}</h2>
                  <span className={ph.missing ? 'ph-count short' : 'ph-count'}>{SLOTS - ph.missing} / {SLOTS} photos</span>
                </header>
                <div className="ph-grid">
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <PhotoSlot key={i} id={p.id} slot={i + 1} name={p.name} src={ph.small[i] || ''} custom={!!ph.custom[i]} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

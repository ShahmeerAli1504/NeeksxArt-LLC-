import { productsFor } from '@/lib/catalog';
import { getProductPhotos } from '@/lib/product-photos';
import ShopCard from './ShopCard';

export default async function ShopGrid({ filter = 'all', className = 'shop-grid', ...rest }) {
  const photos = await getProductPhotos();
  return (
    <div className={className} {...rest}>
      {productsFor(filter).map(p => <ShopCard key={p.id} product={p} photos={photos[p.id]} />)}
    </div>
  );
}

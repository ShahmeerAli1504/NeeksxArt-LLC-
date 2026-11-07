import { productsFor } from '@/lib/catalog';
import ShopCard from './ShopCard';

export default function ShopGrid({ filter = 'all', className = 'shop-grid', ...rest }) {
  return (
    <div className={className} {...rest}>
      {productsFor(filter).map(p => <ShopCard key={p.id} product={p} />)}
    </div>
  );
}

import { PRODUCTS } from '@/lib/catalog';
import TierTable from './TierTable';

export default function PriceTables({ className = 'price-groups', ...rest }) {
  const groups = [...new Set(PRODUCTS.map(p => p.group))];
  return (
    <div className={className} {...rest}>
      {groups.map(g => (
        <div className="price-group reveal" key={g}>
          <h3>{g}</h3>
          {PRODUCTS.filter(p => p.group === g).map(p => (
            <div className="price-row" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                {p.special ? <em>Special order · email inquiry</em> : <em>No minimum</em>}
              </div>
              <TierTable product={p} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

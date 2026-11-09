import { money, singleTier, singleRange, bundlesFor } from '@/lib/catalog';

/** single price first, then the bundle packs (each sold at exactly that quantity) */
export default function TierTable({ product: p }) {
  const single = singleTier(p);
  return (
    <>
      <table className="tiers">
        <thead><tr><th>Order</th><th>Price</th><th>Each</th></tr></thead>
        <tbody>
          <tr><td>Single ({singleRange(p)})</td><td>{money(single.each)} each</td><td>{money(single.each)}</td></tr>
          {bundlesFor(p).map(b => (
            <tr key={b.qty}><td><b>{b.qty}-pack</b></td><td>{money(b.price)}</td><td>{money(b.each)}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="tiers-note">All prices + tax. {p.special ? 'Special order: email to order.' : 'Other quantities: email or DM us.'}</p>
    </>
  );
}

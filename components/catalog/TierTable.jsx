import { money, range } from '@/lib/catalog';

export default function TierTable({ product: p }) {
  return (
    <>
      <table className="tiers">
        <thead><tr><th>Qty</th><th>Each</th></tr></thead>
        <tbody>
          {p.tiers.map((t, i, a) => (
            <tr key={t[0]}><td>{range(t, i, a)}</td><td>{money(t[1])}</td></tr>
          ))}
        </tbody>
      </table>
      {p.packs && (
        <div className="packs">
          {p.packs.map(([q, v]) => (
            <span key={q}><b>{q}-pack</b> {money(v)}</span>
          ))}
        </div>
      )}
    </>
  );
}

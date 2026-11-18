import { BUNDLES, pieceCount } from '@/lib/bundles';

export function BundleIcon({ bundle: b }) {
  return (
    <span className="bundle-ico" style={{ gridTemplateColumns: `repeat(${b.cols},1fr)` }}>
      {b.items.map((k, i) => (
        <i key={i} className={b.shape === 'round' || k !== 'magnet' ? 'round' : ''} />
      ))}
    </span>
  );
}

/** Bundle pack cards on the public /events page */
export function BundleCards({ className = 'pop-bundles', ...rest }) {
  return (
    <div className={className} {...rest}>
      {BUNDLES.map(b => (
        <article className="pop-bundle reveal in" key={b.id}>
          {b.tag && <span className="tag">{b.tag}</span>}
          <BundleIcon bundle={b} />
          <h3>{b.name}</h3>
          <p>{b.blurb}</p>
          <span className="count">{pieceCount(b.items.length)} · {b.price || 'Priced at the booth'}</span>
        </article>
      ))}
    </div>
  );
}

/* Booth poster price table. Prices are read from BUNDLES so the poster always matches checkout.
   Shapes are drawn roughly to scale: 2.5" square magnet, 2.25" round keychain, 1.5" mini. */
const PACK_SIZES = [1, 3, 6, 9];
const only = (kind, tap) => b => !!b.tap === tap && b.items.every(i => i === kind);
const POSTER_ROWS = [
  { id: 'std', lines: [['square', '2.5" Magnets &'], ['round', '2.25" Keychains']], match: only('magnet', false) },
  { id: 'mini', lines: [['mini', 'Mini Keychains']], match: only('keychain15', false) },
  { id: 'tap', lines: [['round', '2.25" Tap-to-Connect']], match: only('keychain', true) },
  { id: 'tapmini', lines: [['mini', 'Mini Tap-to-Connect']], match: only('keychain15', true) }
];
const priceFor = (match, n) => BUNDLES.find(b => match(b) && b.items.length === n)?.price || '—';

export function PosterPriceTable({ className = 'poster-table', ...rest }) {
  return (
    <table className={className} {...rest}>
      <thead>
        <tr><th scope="col">Pack</th>{PACK_SIZES.map(n => <th scope="col" key={n}>{n}</th>)}</tr>
      </thead>
      <tbody>
        {POSTER_ROWS.map(r => (
          <tr key={r.id}>
            <th scope="row">
              {r.lines.map(([shape, label]) => (
                <span className="pt-line" key={label}><i className={`pt-shape pt-${shape}`} aria-hidden="true" />{label}</span>
              ))}
            </th>
            {PACK_SIZES.map(n => <td key={n}>{priceFor(r.match, n)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

/** Compact pack list printed on the booth poster */
export function PosterPacks({ className = 'poster-packs', ...rest }) {
  return (
    <div className={className} {...rest}>
      {BUNDLES.map(b => (
        <div key={b.id}>
          <BundleIcon bundle={b} />
          <b>{b.name}</b>
          {b.price && <span>{b.price}</span>}
        </div>
      ))}
    </div>
  );
}

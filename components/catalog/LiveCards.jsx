import { LIVE, catalogImg, money } from '@/lib/catalog';

export default function LiveCards({ className = 'live-cards', ...rest }) {
  return (
    <div className={className} {...rest}>
      {LIVE.map(l => (
        <div className="live-card reveal" key={l.name}>
          <img src={catalogImg(l.img)} alt={l.name} loading="lazy" />
          <div>
            <h3>{l.name}</h3>
            <p>{l.note}</p>
            <ul>
              {l.packs.map(([n, v]) => (
                <li key={n}><span>{n}</span><b>{money(v)}</b></li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

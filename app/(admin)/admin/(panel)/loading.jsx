// Shown the instant a dashboard tab is clicked, while the page's data loads (the top bar stays put).
export default function Loading() {
  return (
    <div className="adm-wrap adm-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk-row">{Array.from({ length: 4 }, (_, i) => <div key={i} className="sk sk-tile" />)}</div>
      {Array.from({ length: 3 }, (_, i) => <div key={i} className="sk sk-card" />)}
    </div>
  );
}

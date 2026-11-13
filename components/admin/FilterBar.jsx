// Date range + dropdowns + search, shared by every admin list page. Plain GET form: no JavaScript needed.
import Link from 'next/link';
import { PERIODS } from '@/lib/admin-filters';

/**
 * action       page path the form submits to
 * hidden       { name: value } kept on submit (e.g. the current status tab)
 * filt         { period, from, to, q } from readFilters()
 * periodHref   period key → link keeping every other filter
 * selects      [{ name, label, value, options: { key: label } }]
 * placeholder  search box hint
 * clearHref    link that drops all filters (shown when `active`)
 * note         "Showing x of y …" line (shown when `active`)
 */
export default function FilterBar({ action, hidden = {}, filt, periodHref, selects = [], placeholder = 'Search', clearHref, active, note }) {
  return (
    <form className="pay-filter" action={action} method="get">
      {Object.entries(hidden).map(([k, v]) => v ? <input key={k} type="hidden" name={k} value={v} /> : null)}
      <div className="adm-tabs">
        {Object.entries(PERIODS).filter(([k]) => k !== 'custom').map(([k, label]) => (
          <Link key={k} href={periodHref(k)} className={filt.period === k ? 'on' : ''}>{label}</Link>
        ))}
      </div>
      <div className="pay-filter-row">
        <label className={filt.period === 'custom' ? 'on' : ''}><span>From</span><input type="date" name="from" defaultValue={filt.from} /></label>
        <label className={filt.period === 'custom' ? 'on' : ''}><span>To</span><input type="date" name="to" defaultValue={filt.to} /></label>
        {selects.map(s => (
          <label key={s.name}><span>{s.label}</span>
            <select name={s.name} defaultValue={s.value}>
              {Object.entries(s.options).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
        ))}
        <label className="pay-filter-q"><span>Search</span><input type="search" name="q" defaultValue={filt.q} placeholder={placeholder} /></label>
        <button className="btn btn-orange" type="submit">Apply</button>
        {active && <Link className="adm-link" href={clearHref}>Clear filters</Link>}
      </div>
      {active && note && <p className="pay-muted pay-filter-note">{note}</p>}
    </form>
  );
}

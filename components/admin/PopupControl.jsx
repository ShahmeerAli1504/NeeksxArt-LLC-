import { getPopup, getPopupTaxRates } from '@/lib/popup';
import { startPopup, endPopup, saveTaxRates } from '@/lib/popup-actions';

const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '';

const Switch = ({ on }) => (
  <button type="submit" className={`pop-toggle${on ? ' on' : ''}`} role="switch" aria-checked={on}
    aria-label={on ? 'Turn Live Magnets ordering off' : 'Turn Live Magnets ordering on'}>
    <span className="pop-toggle-track"><i /></span>
    <b>{on ? 'ON' : 'OFF'}</b>
  </button>
);

/** Edit the sales tax rate for each pop-up location (Carson City, Dayton, Sacramento…) and add new ones. */
function TaxRates({ rates, saved, liveTaxId }) {
  return (
    <details className="pop-tax" id="tax-rates">
      <summary>Pop-up tax rates <small>{rates.length} locations · edit or add a location</small></summary>
      <form action={saveTaxRates} className="pop-tax-form">
        <p className="pop-tax-help">
          Rates change by county and city. Update a rate here and it&apos;s used the next time you turn Live ordering on for that location
          {liveTaxId ? ' (and right away for the pop-up that is on now, if you change its location)' : ''}.
          {!saved && ' These are the starting rates (checked Nov 2026) until you save.'}
        </p>
        <div className="pop-tax-rows">
          {rates.map(t => (
            <div className="pop-tax-row" key={t.id}>
              <label><small>Location</small><input name={`label_${t.id}`} defaultValue={t.label} maxLength={60} /></label>
              <label className="pop-ctl-rate"><small>Tax %</small><input name={`rate_${t.id}`} type="number" step="0.001" min="0" max="15" defaultValue={t.rate} /></label>
              <label className="pop-tax-rm"><input type="checkbox" name={`remove_${t.id}`} disabled={t.id === liveTaxId} /> <span>Remove</span></label>
            </div>
          ))}
          <div className="pop-tax-row pop-tax-new">
            <label><small>Add a location</small><input name="new_label" maxLength={60} placeholder="e.g. Fallon (Churchill County)" /></label>
            <label className="pop-ctl-rate"><small>Tax %</small><input name="new_rate" type="number" step="0.001" min="0" max="15" placeholder="7.6" /></label>
            <span />
          </div>
        </div>
        <button type="submit" className="btn btn-orange">Save tax rates</button>
      </form>
    </details>
  );
}

/** Dashboard on/off switch for Live Magnets ordering (/event). Off unless Neeks turns it on for a pop-up. */
export default async function PopupControl() {
  const p = await getPopup();
  if (p.forced) return <div className="pop-ctl live" id="live-switch"><div><b>Live Magnets ordering is always ON</b><span>POPUP_ALWAYS_OPEN=1 is set for testing. Remove it before launch.</span></div></div>;
  if (!p.configured) return <div className="pop-ctl" id="live-switch"><div><b>Live Magnets ordering: OFF</b><span>Run supabase/updates-nov-2026.sql in Supabase to turn on this switch.</span></div></div>;
  const { rates, saved } = await getPopupTaxRates();

  if (p.live) {
    return (
      <>
        <form action={endPopup} className="pop-ctl live" id="live-switch">
          <div>
            <b><i className="pop-dot" /> Live Magnets ordering is ON · {p.name}</b>
            <span>
              Guests can order at /event. Sales tax: {p.taxLabel} {p.taxRate}%.
              {' '}Started {time(p.startedAt)} · {p.endsAt ? `turns off automatically ${time(p.endsAt)}` : 'stays on until you switch it off'}
            </span>
          </div>
          <Switch on />
        </form>
        <TaxRates rates={rates} saved={saved} liveTaxId={p.taxId} />
      </>
    );
  }

  const lastTax = rates.some(t => t.id === p.taxId) ? p.taxId : (rates.find(t => t.id === 'washoe') || rates[0]).id;
  return (
    <>
      <form action={startPopup} className="pop-ctl" id="live-switch">
        <div>
          <b>Live Magnets ordering is OFF</b>
          <span>{p.expired ? `${p.name} turned off automatically. ` : ''}Online customers can&apos;t order Live Magnets. Turn it on when your pop-up starts.</span>
        </div>
        <div className="pop-ctl-form">
          <label><small>Event</small>
            <input name="name" maxLength={60} placeholder="e.g. Midtown Art Walk" />
          </label>
          <label><small>Where (sales tax)</small>
            <select name="tax" defaultValue={lastTax}>
              {rates.map(t => <option key={t.id} value={t.id}>{t.label} · {t.rate}%</option>)}
              <option value="custom">Other — type the rate →</option>
            </select>
          </label>
          <label className="pop-ctl-rate"><small>Other rate %</small>
            <input name="customRate" type="number" step="0.001" min="0" max="15" placeholder="8.25" />
          </label>
          <label><small>Turn off automatically</small>
            <select name="hours" defaultValue="8">
              {[2, 4, 6, 8, 10, 12].map(h => <option key={h} value={h}>after {h} hours</option>)}
              <option value="off">Never (I&apos;ll switch it off)</option>
            </select>
          </label>
          <Switch on={false} />
        </div>
      </form>
      <TaxRates rates={rates} saved={saved} />
    </>
  );
}

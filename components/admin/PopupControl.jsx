import { getPopup } from '@/lib/popup';
import { startPopup, endPopup } from '@/lib/popup-actions';
import { POPUP_TAX } from '@/lib/popup-tax';

const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '';

const Switch = ({ on }) => (
  <button type="submit" className={`pop-toggle${on ? ' on' : ''}`} role="switch" aria-checked={on}
    aria-label={on ? 'Turn Live Magnets ordering off' : 'Turn Live Magnets ordering on'}>
    <span className="pop-toggle-track"><i /></span>
    <b>{on ? 'ON' : 'OFF'}</b>
  </button>
);

/** Dashboard on/off switch for Live Magnets ordering (/event). Off unless Neeks turns it on for a pop-up. */
export default async function PopupControl() {
  const p = await getPopup();
  if (p.forced) return <div className="pop-ctl live" id="live-switch"><div><b>Live Magnets ordering is always ON</b><span>POPUP_ALWAYS_OPEN=1 is set for testing. Remove it before launch.</span></div></div>;
  if (!p.configured) return <div className="pop-ctl" id="live-switch"><div><b>Live Magnets ordering: OFF</b><span>Run supabase/updates-nov-2026.sql in Supabase to turn on this switch.</span></div></div>;

  if (p.live) {
    return (
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
    );
  }

  const lastTax = POPUP_TAX.some(t => t.id === p.taxId) ? p.taxId : 'washoe';
  return (
    <form action={startPopup} className="pop-ctl" id="live-switch">
      <div>
        <b>Live Magnets ordering is OFF</b>
        <span>{p.expired ? `${p.name} turned off automatically. ` : ''}Online customers can't order Live Magnets. Turn it on when your pop-up starts.</span>
      </div>
      <div className="pop-ctl-form">
        <label><small>Event</small>
          <input name="name" maxLength={60} placeholder="e.g. Midtown Art Walk" />
        </label>
        <label><small>Where (sales tax)</small>
          <select name="tax" defaultValue={lastTax}>
            {POPUP_TAX.map(t => <option key={t.id} value={t.id}>{t.label} · {t.rate}%</option>)}
            <option value="custom">Other — type the rate →</option>
          </select>
        </label>
        <label className="pop-ctl-rate"><small>Other rate %</small>
          <input name="customRate" type="number" step="0.001" min="0" max="15" placeholder="8.25" />
        </label>
        <label><small>Turn off automatically</small>
          <select name="hours" defaultValue="8">
            {[2, 4, 6, 8, 10, 12].map(h => <option key={h} value={h}>after {h} hours</option>)}
            <option value="off">Never (I'll switch it off)</option>
          </select>
        </label>
        <Switch on={false} />
      </div>
    </form>
  );
}

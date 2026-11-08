import { getPopup } from '@/lib/popup';
import { startPopup, endPopup } from '@/lib/popup-actions';

const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '';

/** Dashboard switch for the guest order page (/event). Closed unless a pop-up is live. */
export default async function PopupControl() {
  const p = await getPopup();
  if (p.forced) return <div className="pop-ctl live"><b>Live ordering is always open</b><span>POPUP_ALWAYS_OPEN=1 is set. Remove it before launch.</span></div>;
  if (!p.configured) return <div className="pop-ctl"><b>Live ordering is closed</b><span>Run supabase/updates-nov-2026.sql in Supabase to turn on the pop-up switch.</span></div>;
  if (p.live) {
    return (
      <div className="pop-ctl live">
        <div><b><i className="pop-dot" /> Live now: {p.name}</b><span>Guests can order at /event · started {time(p.startedAt)} · closes automatically {time(p.endsAt)}</span></div>
        <form action={endPopup}><button className="btn btn-ink" type="submit">End pop-up</button></form>
      </div>
    );
  }
  return (
    <form action={startPopup} className="pop-ctl">
      <div><b>Live ordering is closed</b><span>{p.expired ? `${p.name} ended automatically. ` : ''}Start a pop-up to open the guest order page (/event).</span></div>
      <div className="pop-ctl-form">
        <input name="name" required maxLength={60} placeholder="Event name, e.g. Midtown Art Walk" aria-label="Event name" />
        <select name="hours" defaultValue="8" aria-label="Open for">
          {[2, 4, 6, 8, 10, 12].map(h => <option key={h} value={h}>Open {h} hours</option>)}
        </select>
        <button className="btn btn-orange" type="submit">Start pop-up</button>
      </div>
    </form>
  );
}

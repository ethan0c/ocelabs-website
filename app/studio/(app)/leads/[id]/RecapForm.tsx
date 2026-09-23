'use client';

import { useActionState, useState, useTransition } from 'react';
import { PACKAGES, weeksLabel, type Kind } from '@/lib/pricing';
import { act, draftRecapAction, type ActionState } from './actions';

const LABELS = [
  'Their business and who the site is for',
  'The main problem with what they have now',
  'What a visitor should do on the new site',
  'Deadline, and who approves',
];

/**
 * The recap email, two steps: paste call notes and let Claude draft the four
 * bullets and the package; read it, fix it, send it.
 */
export default function RecapForm({ id }: { id: string }) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(act, {});
  const [notes, setNotes] = useState('');
  const [bullets, setBullets] = useState(['', '', '', '']);
  const [kind, setKind] = useState<Kind>('website');
  const [range, setRange] = useState('$3,000 to $6,000');
  const [weeks, setWeeks] = useState(weeksLabel(PACKAGES.website.weeks));
  const [drafting, startDraft] = useTransition();
  const [draftError, setDraftError] = useState<string | null>(null);

  const draft = () =>
    startDraft(async () => {
      setDraftError(null);
      const r = await draftRecapAction(id, notes);
      if ('error' in r) {
        setDraftError(r.error);
        return;
      }
      setBullets([...r.bullets]);
      setKind(r.kind);
      setRange(r.range);
      setWeeks(r.weeks);
    });

  return (
    <div className="recap">
      <div className="act">
        <div className="field field--inline">
          <label htmlFor="call-notes">Call notes</label>
          <textarea
            id="call-notes"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste the notetaker's summary, a transcript, or your own notes from the call."
          />
        </div>
        <button type="button" className="btn" onClick={draft} disabled={drafting || !notes.trim()}>
          {drafting ? 'Drafting…' : 'Draft the recap from these notes'}
        </button>
        {draftError && (
          <p className="form-note act-note" data-kind="error" role="status">
            {draftError}
          </p>
        )}
      </div>

      <form action={dispatch} className="act">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value="recap" />
        {LABELS.map((label, i) => (
          <div key={i} className="field field--inline">
            <label htmlFor={`b${i + 1}`}>{label}</label>
            <input
              id={`b${i + 1}`}
              name={`b${i + 1}`}
              type="text"
              value={bullets[i]}
              onChange={(e) => setBullets((b) => b.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </div>
        ))}
        <div className="field field--inline">
          <label htmlFor="packageLabel">Likely package</label>
          <select
            id="packageLabel"
            name="packageLabel"
            value={PACKAGES[kind].label}
            onChange={(e) => {
              const k = (Object.keys(PACKAGES) as Kind[]).find((x) => PACKAGES[x].label === e.target.value) ?? 'website';
              setKind(k);
              setWeeks(weeksLabel(PACKAGES[k].weeks));
            }}
          >
            {(Object.keys(PACKAGES) as Kind[]).map((k) => (
              <option key={k} value={PACKAGES[k].label}>
                {PACKAGES[k].label}
              </option>
            ))}
          </select>
        </div>
        <div className="field field--inline">
          <label htmlFor="range">Range said on the call</label>
          <input id="range" name="range" type="text" value={range} onChange={(e) => setRange(e.target.value)} />
        </div>
        <div className="field field--inline">
          <label htmlFor="weeks">Timeline</label>
          <input id="weeks" name="weeks" type="text" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </div>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send recap with questionnaire'}
        </button>
        {(state.ok || state.error) && (
          <p className="form-note act-note" data-kind={state.error ? 'error' : 'ok'} role="status">
            {state.error ?? state.ok}
          </p>
        )}
      </form>
    </div>
  );
}

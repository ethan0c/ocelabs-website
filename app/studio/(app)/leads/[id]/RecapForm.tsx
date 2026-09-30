'use client';

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { PACKAGES, weeksLabel, type Kind } from '@/lib/pricing';
import { QUESTIONS } from '@/app/q/[token]/questions';
import { act, draftRecapAction, saveCallAction, type ActionState } from './actions';

const ALL = QUESTIONS.flatMap((g) => g.items);
/** Same key as CALL_NOTES in lib/studio.ts, which is server-only. */
const NOTES_KEY = '_call_notes';

function PrefillField({ q, saved }: { q: (typeof ALL)[number]; saved: Record<string, string> }) {
  return (
    <div className="field field--inline">
      <label htmlFor={`pre_${q.id}`}>{q.text}</label>
      <textarea id={`pre_${q.id}`} name={`pre_${q.id}`} rows={2} defaultValue={saved[q.id] ?? ''} />
    </div>
  );
}

const LABELS = [
  'Their business and who the site is for',
  'The main problem with what they have now',
  'What a visitor should do on the new site',
  'Deadline, and who approves',
];

type Save = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; at: Date } | { kind: 'error'; message: string };

/**
 * The call and the recap, top to bottom: type their answers and your notes
 * during the call (saved to the lead as you go), then draft the recap from
 * the notes, check it, and send it with the questionnaire link.
 */
export default function RecapForm({ id, saved }: { id: string; saved: Record<string, string> }) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(act, {});
  const [notes, setNotes] = useState(saved[NOTES_KEY] ?? '');
  const [bullets, setBullets] = useState(['', '', '', '']);
  const [kind, setKind] = useState<Kind>('website');
  const [range, setRange] = useState('$3,000 to $6,000');
  const [weeks, setWeeks] = useState(weeksLabel(PACKAGES.website.weeks));
  const [drafting, startDraft] = useTransition();
  const [draftError, setDraftError] = useState<string | null>(null);
  const [save, setSave] = useState<Save>({ kind: 'idle' });
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Everything typed so far: the answer boxes plus the notes.
  const collect = () => {
    const out: Record<string, string> = {};
    if (form.current) {
      for (const [k, v] of new FormData(form.current)) {
        if (typeof v !== 'string') continue;
        if (k.startsWith('pre_')) out[k.slice(4)] = v;
        if (k === 'call_notes') out[NOTES_KEY] = v;
      }
    }
    return out;
  };

  const saveNow = async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setSave({ kind: 'saving' });
    const r = await saveCallAction(id, collect());
    setSave('error' in r ? { kind: 'error', message: r.error } : { kind: 'saved', at: new Date() });
  };

  // Save shortly after typing stops, and straight away when a box loses focus.
  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(saveNow, 800);
  };

  // Don't let the tab close on unsaved typing.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (timer.current || save.kind === 'saving') e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [save.kind]);

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

  // Dispatched by hand so a failed send doesn't clear the answer boxes.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  return (
    <form ref={form} onSubmit={onSubmit} onInput={schedule} onBlur={() => timer.current && saveNow()} className="recap act">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value="recap" />

      <fieldset className="recap-prefill">
        <legend className="eyebrow">On the call</legend>
        <p className="tbl-sub">
          Type as they talk; it saves to this lead as you go. These answers go to the client
          pre-filled, to confirm or correct. Leave blank anything the call didn&rsquo;t cover.
        </p>
        {ALL.filter((q) => q.call).map((q) => (
          <PrefillField key={q.id} q={q} saved={saved} />
        ))}
        <details open={ALL.some((q) => !q.call && saved[q.id])}>
          <summary>Anything else they already told you</summary>
          <p className="tbl-sub">The rest is homework for the client. Pre-fill only what you&rsquo;re sure of.</p>
          {ALL.filter((q) => !q.call).map((q) => (
            <PrefillField key={q.id} q={q} saved={saved} />
          ))}
        </details>
        <div className="field field--inline">
          <label htmlFor="call-notes">Call notes (only we see these)</label>
          <textarea
            id="call-notes"
            name="call_notes"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else: their words, worries, names, the notetaker's summary."
          />
        </div>
        <p className="form-note act-note" data-kind={save.kind === 'error' ? 'error' : undefined} role="status">
          {save.kind === 'saving' && 'Saving…'}
          {save.kind === 'saved' && `Saved ${save.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
          {save.kind === 'error' && `Not saved: ${save.message}`}
        </p>
      </fieldset>

      <fieldset className="recap-prefill">
        <legend className="eyebrow">The recap email</legend>
        <button type="button" className="btn" onClick={draft} disabled={drafting || !notes.trim()}>
          {drafting ? 'Drafting…' : 'Draft the recap from the call notes'}
        </button>
        {draftError && (
          <p className="form-note act-note" data-kind="error" role="status">
            {draftError}
          </p>
        )}
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
      </fieldset>

      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? 'Sending…' : 'Send recap with questionnaire'}
      </button>
      {(state.ok || state.error) && (
        <p className="form-note act-note" data-kind={state.error ? 'error' : 'ok'} role="status">
          {state.error ?? state.ok}
        </p>
      )}
    </form>
  );
}

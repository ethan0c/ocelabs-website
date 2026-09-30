'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { submit, type QState } from './actions';
import { QUESTIONS } from './questions';

export default function QForm({
  token,
  name,
  company,
  prefill,
}: {
  token: string;
  name: string;
  company: string;
  /** Answers we noted on the call; the client can change them. */
  prefill: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<QState, FormData>(submit, {});
  const form = useRef<HTMLFormElement>(null);
  const key = `oce-q-${token}`;

  // Keep a draft in the browser so a closed tab or a failed send loses nothing.
  useEffect(() => {
    if (!form.current) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
      for (const [name, value] of Object.entries(saved)) {
        const el = form.current.elements.namedItem(name);
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = value;
      }
    } catch {}
  }, [key]);

  useEffect(() => {
    if (state.ok) {
      try { localStorage.removeItem(key); } catch {}
    }
  }, [state.ok, key]);

  function save() {
    if (!form.current) return;
    const out: Record<string, string> = {};
    for (const [name, value] of new FormData(form.current)) {
      if (name !== 'token' && typeof value === 'string') out[name] = value;
    }
    try { localStorage.setItem(key, JSON.stringify(out)); } catch {}
  }

  // Dispatched by hand rather than through <form action>, which would clear
  // every answer after a send that comes back with an error.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  if (state.ok) {
    return (
      <div className="q-done">
        <h2 className="h2">Thank you.</h2>
        <p className="lede">
          We have your answers. Within two business days you will get a fixed quote, a launch
          date, and a short agreement to sign.
        </p>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={onSubmit} onInput={save} className="q-form">
      <input type="hidden" name="token" value={token} />
      <fieldset className="q-group">
        <legend className="eyebrow">For the paperwork</legend>
        <div className="field">
          <label htmlFor="contact_name">Your name</label>
          <input id="contact_name" name="contact_name" type="text" defaultValue={name} />
        </div>
        <div className="field">
          <label htmlFor="company">Legal business name, as it should read on the agreement</label>
          <input id="company" name="company" type="text" defaultValue={company} />
        </div>
      </fieldset>
      {QUESTIONS.map((g, gi) => (
        <fieldset key={g.title} className="q-group">
          <legend className="eyebrow">{g.title}</legend>
          {g.items.map((q, qi) => {
            const n = QUESTIONS.slice(0, gi).reduce((s, x) => s + x.items.length, 0) + qi + 1;
            return (
              <div key={q.id} className="field">
                <label htmlFor={q.id}>
                  <span className="q-num">{n}.</span> {q.text}
                </label>
                {prefill[q.id] && <p className="q-prefilled">From our call. Change anything we got wrong.</p>}
                <textarea id={q.id} name={q.id} rows={3} defaultValue={prefill[q.id] ?? ''} />
              </div>
            );
          })}
        </fieldset>
      ))}
      <button type="submit" className="block block--primary" disabled={pending}>
        {pending ? 'Sending' : 'Send answers'} <span className="arrow" aria-hidden="true">&rarr;</span>
      </button>
      <p className="form-note" data-kind={state.error ? 'error' : undefined} role="status">
        {state.error}
      </p>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { submit, type QState } from './actions';
import { QUESTIONS } from './questions';

export default function QForm({ token, name, company }: { token: string; name: string; company: string }) {
  const [state, action, pending] = useActionState<QState, FormData>(submit, {});

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
    <form action={action} className="q-form">
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
                <textarea id={q.id} name={q.id} rows={3} />
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

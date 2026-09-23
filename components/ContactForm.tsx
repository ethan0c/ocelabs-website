'use client';

import { FormEvent, useState } from 'react';

/* Our own route: creates the lead in the studio and replies from hello@. */
const ENDPOINT = '/api/inquiry';

/* Ranges start at the floor stated on the page. "Not sure" stays first so an
   undecided visitor isn't pushed into a number before the first conversation. */
const BUDGETS = ['Not sure yet', '$3k–6k', '$6k–12k', '$12k–25k', '$25k+'];

type Note = { kind: 'error' | 'ok'; text: string } | null;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [hp, setHp] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState<Note>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNote(null);

    if (!name.trim()) {
      setNote({ kind: 'error', text: 'Please add your name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote({ kind: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!message.trim()) {
      setNote({ kind: 'error', text: 'Please add a message.' });
      return;
    }

    setSending(true);
    try {
      const body = new FormData();
      body.append('name', name);
      body.append('email', email);
      body.append('message', message);
      body.append('budget', budget);
      body.append('website', hp);

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setSent(true);
        return;
      }

      const data = (await res.json()) as { error?: string; errors?: Array<{ message?: string }> };
      setNote({
        kind: 'error',
        text: data.error ?? data.errors?.[0]?.message ?? 'Something went wrong. Try emailing us directly.',
      });
    } catch {
      setNote({ kind: 'error', text: 'Something went wrong. Try emailing us directly.' });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div role="status">
        <p className="h2">Thanks — we&apos;ll be in touch.</p>
        <p className="lede" style={{ marginTop: '0.75rem' }}>
          Usually within a day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* Honeypot. Hidden from people; bots fill every field. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="What are you building?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="budget">Budget</label>
        <span className="select-wrap">
          <select
            id="budget"
            name="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </span>
      </div>

      <button type="submit" className="block block--primary" disabled={sending}>
        {sending ? 'Sending' : 'Send'} <span className="arrow" aria-hidden="true">&rarr;</span>
      </button>

      <p className="form-note" data-kind={note?.kind} role="status" aria-live="polite">
        {note?.text}
      </p>

      <p className="contact-direct">
        Or email <a href="mailto:hello@ocelabs.xyz">hello@ocelabs.xyz</a>
      </p>
    </form>
  );
}

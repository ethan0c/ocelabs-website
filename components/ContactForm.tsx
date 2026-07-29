'use client';

import { FormEvent, useState } from 'react';

const ENDPOINT = 'https://formspree.io/f/movldbbk';

type Note = { kind: 'error' | 'ok'; text: string } | null;

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState<Note>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNote(null);

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
      body.append('email', email);
      body.append('message', message);

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setSent(true);
        return;
      }

      const data = (await res.json()) as { errors?: Array<{ message?: string }> };
      setNote({
        kind: 'error',
        text: data.errors?.[0]?.message ?? 'Something went wrong. Try emailing us directly.',
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

      <button type="submit" className="send" disabled={sending}>
        {sending ? 'Sending' : 'Send'} <span aria-hidden="true">&rarr;</span>
      </button>

      <p className="form-note" data-kind={note?.kind} role="status" aria-live="polite">
        {note?.text}
      </p>

      <p className="contact-direct">
        Or email <a href="mailto:contact@ocelabs.tech">contact@ocelabs.tech</a>
      </p>
    </form>
  );
}

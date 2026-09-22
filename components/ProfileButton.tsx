'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/*
 * Top-right profile button. Signed out: a hairline person glyph that goes
 * to the studio sign-in. Signed in: the account's initial, going to the
 * studio. The check is a fetch after mount so the public pages stay static.
 */
export default function ProfileButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { email: string } | null) => {
        if (live && me?.email) setEmail(me.email);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (email) {
    return (
      <Link href="/studio" className="profile-btn" data-in aria-label={`Studio, signed in as ${email}`} title={email}>
        <span aria-hidden="true">{email[0].toUpperCase()}</span>
      </Link>
    );
  }

  return (
    <Link href="/studio/sign-in" className="profile-btn" aria-label="Sign in" title="Sign in">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="8.5" r="4" />
        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
      </svg>
    </Link>
  );
}

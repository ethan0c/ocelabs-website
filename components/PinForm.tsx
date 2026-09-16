'use client';

import { useActionState } from 'react';
import { unlock, type UnlockState } from '@/app/pricing/actions';

export default function PinForm() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, {});

  return (
    <form action={action} className="pin-form">
      <div className="field">
        <label htmlFor="pin">PIN</label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder="••••"
        />
      </div>
      <button type="submit" className="send" disabled={pending}>
        {pending ? 'Checking' : 'Open'} <span aria-hidden="true">&rarr;</span>
      </button>
      <p className="form-note" data-kind={state.error ? 'error' : undefined} role="status">
        {state.error}
      </p>
    </form>
  );
}

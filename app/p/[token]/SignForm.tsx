'use client';

import { useActionState } from 'react';
import { sign, type SignState } from './actions';

export default function SignForm({
  token,
  name,
  email,
  client,
}: {
  token: string;
  name: string;
  email: string;
  client: string;
}) {
  const [state, action, pending] = useActionState<SignState, FormData>(sign, {});

  if (state.ok) {
    return (
      <div className="sign-done">
        <p className="eyebrow">Signed</p>
        <h2 className="h2">Thank you. A signed copy is on its way to your inbox.</h2>
        <p className="lede">
          You will also get the deposit invoice in a separate email. The project starts
          once it clears and your files are in.
        </p>
        <a className="block" href={`/p/${token}/pdf`}>
          Download the signed PDF
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="sign-form" id="sign">
      <input type="hidden" name="token" value={token} />
      <p className="eyebrow">Sign</p>
      <h2 className="h2">Accept on behalf of {client}.</h2>
      <div className="field">
        <label htmlFor="sign-name">Full name</label>
        <input id="sign-name" name="name" type="text" defaultValue={name} autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="sign-email">Email for the signed copy</label>
        <input id="sign-email" name="email" type="email" defaultValue={email} autoComplete="email" required />
      </div>
      <label className="sign-agree">
        <input type="checkbox" name="agree" required />
        <span>
          I have read this agreement, I have authority to accept it for {client}, and I agree that
          typing my name here is my electronic signature.
        </span>
      </label>
      <button type="submit" className="block block--primary" disabled={pending}>
        {pending ? 'Signing' : 'Sign and accept'} <span className="arrow" aria-hidden="true">&rarr;</span>
      </button>
      <p className="form-note" data-kind={state.error ? 'error' : undefined} role="status">
        {state.error}
      </p>
    </form>
  );
}

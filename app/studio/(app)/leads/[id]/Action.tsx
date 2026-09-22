'use client';

import { useActionState } from 'react';
import { act, type ActionState } from './actions';

/**
 * One studio action as a form. `fields` render inside; the submit button
 * carries the action name. Result text appears under it.
 */
export default function Action({
  id,
  action,
  label,
  primary,
  confirm,
  children,
}: {
  id: string;
  action: string;
  label: string;
  primary?: boolean;
  confirm?: string;
  children?: React.ReactNode;
}) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(act, {});
  return (
    <form
      action={dispatch}
      className="act"
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      {children}
      <button type="submit" className={`btn${primary ? ' btn--primary' : ''}`} disabled={pending}>
        {pending ? 'Working…' : label}
      </button>
      {(state.ok || state.error) && (
        <p className="form-note act-note" data-kind={state.error ? 'error' : 'ok'} role="status">
          {state.error ?? state.ok}
        </p>
      )}
    </form>
  );
}

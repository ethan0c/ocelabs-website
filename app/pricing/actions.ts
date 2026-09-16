'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE, PIN, token } from './auth';

export type UnlockState = { error?: string };

export async function unlock(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  const pin = String(form.get('pin') ?? '').trim();
  if (pin !== PIN) {
    return { error: 'Wrong PIN.' };
  }
  const jar = await cookies();
  jar.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/pricing',
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect('/pricing');
}

export async function lock() {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: '/pricing' });
  redirect('/pricing');
}

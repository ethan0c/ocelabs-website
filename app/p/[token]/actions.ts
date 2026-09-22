'use server';

import { headers } from 'next/headers';
import { signProposal } from '@/lib/studio';

export type SignState = { ok?: boolean; error?: string };

export async function sign(_prev: SignState, form: FormData): Promise<SignState> {
  const token = String(form.get('token') ?? '');
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const agree = form.get('agree') === 'on';
  if (name.length < 2) return { error: 'Type your full name as it should appear on the agreement.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter the email address we should send the signed copy to.' };
  }
  if (!agree) {
    return { error: 'Tick the box to confirm you have read the agreement and intend to sign it electronically.' };
  }

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  const ua = (h.get('user-agent') || 'unknown').slice(0, 300);
  try {
    await signProposal(token, { name, email, ip, ua });
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not record the signature.' };
  }
}

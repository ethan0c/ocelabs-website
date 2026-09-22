'use server';

import { submitQuestionnaire } from '@/lib/studio';
import { QUESTIONS } from './questions';

export type QState = { ok?: boolean; error?: string };

export async function submit(_prev: QState, form: FormData): Promise<QState> {
  const token = String(form.get('token') ?? '');
  const answers: Record<string, string> = {};
  for (const g of QUESTIONS) {
    for (const q of g.items) {
      const v = String(form.get(q.id) ?? '').trim();
      if (v) answers[q.id] = v.slice(0, 4000);
    }
  }
  for (const k of ['contact_name', 'company']) {
    const v = String(form.get(k) ?? '').trim();
    if (v) answers[k] = v.slice(0, 200);
  }
  if (Object.keys(answers).length < 3) return { error: 'A few more answers would help; even one line each is fine.' };
  try {
    await submitQuestionnaire(token, answers);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not save your answers.' };
  }
}

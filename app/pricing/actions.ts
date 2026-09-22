'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { decodeInput } from '@/lib/pricing';
import { saveQuote } from '@/lib/studio';

/** "Save to lead" in the estimator: the quote becomes the lead's, then back to the lead. */
export async function saveQuoteToLead(leadId: string, encoded: string) {
  await requireSession(`/pricing?lead=${leadId}&q=${encoded}`);
  const input = decodeInput(encoded);
  if (!input) throw new Error('Could not read the quote.');
  await saveQuote(leadId, input);
  redirect(`/studio/leads/${leadId}`);
}

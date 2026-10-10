'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { computeQuote } from '@/lib/pricing';
import { buildProposal, sanitiseEdits, type ProposalEdits } from '@/lib/proposal';
import { getLead, leadQuote, saveProposalEdits } from '@/lib/studio';

export type EditState = { ok?: string; error?: string };

/*
 * The wording editor's two buttons. Edits are checked against the proposal
 * generated from the lead's saved quote, so only real changes are kept.
 */

async function run(id: string, fn: () => Promise<string>): Promise<EditState> {
  await requireSession(`/studio/leads/${id}/proposal`);
  try {
    const ok = await fn();
    revalidatePath(`/studio/leads/${id}`);
    revalidatePath(`/studio/leads/${id}/proposal`);
    return { ok };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not save.' };
  }
}

export async function saveEdits(id: string, raw: ProposalEdits): Promise<EditState> {
  return run(id, async () => {
    const lead = await getLead(id);
    const quote = lead && leadQuote(lead);
    if (!quote) throw new Error('Save a quote for this lead first.');
    const edits = sanitiseEdits(raw, buildProposal(computeQuote(quote)));
    await saveProposalEdits(id, edits);
    return edits
      ? 'Wording saved. It goes out with the next proposal you send from the lead page.'
      : 'Nothing differs from the generated wording, so there is nothing to save.';
  });
}

export async function clearEdits(id: string): Promise<EditState> {
  return run(id, async () => {
    await saveProposalEdits(id, null);
    return 'Back to the generated wording.';
  });
}

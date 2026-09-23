'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import type { Stage } from '@/lib/db/schema';
import * as S from '@/lib/studio';
import { draftRecap, type RecapDraft } from '@/lib/recap';

/*
 * Buttons on the lead page. Each one is a workflow step from lib/studio.ts;
 * this file only reads the form and reports back.
 */

export type ActionState = { ok?: string; error?: string };

async function run(id: string, fn: () => Promise<string>): Promise<ActionState> {
  await requireSession(`/studio/leads/${id}`);
  try {
    const ok = await fn();
    revalidatePath(`/studio/leads/${id}`);
    revalidatePath('/studio');
    return { ok };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function act(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = str(form, 'id');
  const what = str(form, 'action');

  switch (what) {
    case 'emailA':
      return run(id, async () => ((await S.sendEmailA(id, str(form, 'topic'))) ? 'Email A sent.' : 'Gmail is not connected; nothing sent.'));
    case 'emailA2':
      return run(id, async () => ((await S.sendEmailA2(id)) ? 'Nudge sent.' : 'Gmail is not connected; nothing sent.'));
    case 'bookCall': {
      const at = new Date(str(form, 'callAt'));
      if (Number.isNaN(at.getTime())) return { error: 'Pick a date and time for the call.' };
      return run(id, async () => {
        await S.bookCall(id, at);
        return 'Call booked.';
      });
    }
    case 'recap': {
      const bullets = [1, 2, 3, 4].map((n) => str(form, `b${n}`)).filter(Boolean);
      if (bullets.length < 2) return { error: 'Add at least two recap points.' };
      return run(id, async () => {
        const ok = await S.sendRecap(id, {
          bullets,
          packageLabel: str(form, 'packageLabel') || 'Website Package',
          range: str(form, 'range') || '$3,000 to $6,000',
          weeks: str(form, 'weeks') || '4 to 6 weeks',
        });
        return ok ? 'Recap sent with the questionnaire link.' : 'Gmail is not connected; the questionnaire link is on this page.';
      });
    }
    case 'proposal':
      return run(id, async () => {
        const r = await S.createAndSendProposal(id);
        return r.sent ? 'Proposal sent.' : `Proposal created (Gmail not connected). Link: ${S.proposalLink(r.proposal.token)}`;
      });
    case 'brandFiles':
      return run(id, async () => {
        await S.markBrandFiles(id);
        return 'Brand files marked as received.';
      });
    case 'copy':
      return run(id, async () => {
        await S.markCopy(id);
        return 'Copy marked as received.';
      });
    case 'designApproved':
      return run(id, async () => {
        await S.approveDesign(id);
        return 'Design approved.';
      });
    case 'stagingApproved': {
      const extras: Array<{ label: string; amount: number }> = [];
      for (const n of [1, 2, 3]) {
        const label = str(form, `co${n}`);
        const amount = Number(str(form, `co${n}a`));
        if (label && amount > 0) extras.push({ label, amount: Math.round(amount) });
      }
      return run(id, async () => {
        await S.approveStaging(id, extras);
        return 'Final invoice sent with Email G.';
      });
    }
    case 'launched': {
      const domain = str(form, 'domain');
      if (!domain) return { error: 'Enter the live domain.' };
      return run(id, async () => {
        await S.markLaunched(id, {
          domain,
          analyticsLink: str(form, 'analyticsLink') || undefined,
          repoLink: str(form, 'repoLink') || undefined,
          hostingLink: str(form, 'hostingLink') || undefined,
          searchConsoleLink: str(form, 'searchConsoleLink') || undefined,
        });
        return 'Handover email sent. Day 30 is scheduled.';
      });
    }
    case 'closeWon':
      return run(id, async () => {
        await S.closeLead(id, true);
        return 'Closed, won.';
      });
    case 'closeLost':
      return run(id, async () => {
        await S.closeLead(id, false);
        return 'Closed, lost.';
      });
    case 'stage': {
      const stage = str(form, 'stage') as Stage;
      return run(id, async () => {
        await S.setStage(id, stage, str(form, 'nextAction') || null, null);
        return 'Stage updated.';
      });
    }
    case 'notes':
      return run(id, async () => {
        await S.setNotes(id, str(form, 'notes'));
        return 'Notes saved.';
      });
    default:
      return { error: 'Unknown action.' };
  }
}

/** Call notes → the recap form's fields. A draft, nothing is sent. */
export async function draftRecapAction(id: string, notes: string): Promise<RecapDraft | { error: string }> {
  await requireSession(`/studio/leads/${id}`);
  try {
    return await draftRecap(notes);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not draft the recap.' };
  }
}

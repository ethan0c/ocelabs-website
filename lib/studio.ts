import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, desc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { db, events, leads, payments, proposals, type Lead, type Payment, type Proposal, type Questionnaire, type Stage } from '@/lib/db';
import { siteUrl } from '@/lib/auth';
import * as E from '@/lib/emails';
import { draftMail, gmailConfigured, sendMail, type Attachment } from '@/lib/gmail';
import { CONTENT_DEADLINE_DAYS, PROPOSAL_VALID_DAYS, WARRANTY_DAYS, computeQuote, warrantyDays, usd, weeksLabel, type QuoteInput } from '@/lib/pricing';
import { buildProposal, hasEdits, proposalFileName, type ProposalEdits } from '@/lib/proposal';
import { renderProposalPdf } from '@/lib/proposal-pdf';
import { gistOf } from '@/lib/summarize';
import { notifyNewLead, notifyStudio } from '@/lib/notify';
import { createDraftInvoice, createRetainer, dashboardUrl, endRetainer, finalizeAndSend, findOrCreateCustomer, stripe, stripeLive } from '@/lib/stripe';

/*
 * The client workflow (docs/client-workflow.txt) as code. Each stage's
 * trigger is a function here; the emails go out from hello@ through Gmail,
 * invoices through Stripe, and every step is written to the lead's event
 * log. What needs a person — the call, the quote, review feedback, the
 * day-30 observation — is left as a studio action or a Gmail draft.
 */

const signer = () => process.env.STUDIO_SIGNER || 'The OCE Labs team';
const calLink = () => process.env.CAL_LINK || 'https://cal.com/ocelabs/intro';
const DAY = 86400_000;

export const token = () => randomBytes(18).toString('base64url');

/** n business days after d (Mon–Fri; holidays are not modelled). */
export function addBusinessDays(d: Date, n: number) {
  const out = new Date(d);
  let left = n;
  while (left > 0) {
    out.setDate(out.getDate() + 1);
    const day = out.getDay();
    if (day !== 0 && day !== 6) left--;
  }
  return out;
}

export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

/* ── Reads ─────────────────────────────────────────────────────────────── */

export async function getLead(id: string) {
  return db.query.leads.findFirst({ where: eq(leads.id, id) });
}

export async function listLeads() {
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function leadDetail(id: string) {
  const lead = await getLead(id);
  if (!lead) return null;
  const [log, props, pays] = await Promise.all([
    db.select().from(events).where(eq(events.leadId, id)).orderBy(desc(events.at)),
    db.select().from(proposals).where(eq(proposals.leadId, id)).orderBy(desc(proposals.createdAt)),
    db.select().from(payments).where(eq(payments.leadId, id)).orderBy(payments.stageIndex),
  ]);
  return { lead, log, proposals: props, payments: pays };
}

export async function log(leadId: string, kind: string, detail?: Record<string, unknown>) {
  await db.insert(events).values({ leadId, kind, detail: detail ?? null });
}

async function hasEvent(leadId: string, kind: string) {
  const row = await db.query.events.findFirst({ where: and(eq(events.leadId, leadId), eq(events.kind, kind)) });
  return Boolean(row);
}

async function update(id: string, patch: Partial<Lead>) {
  const [row] = await db.update(leads).set(patch).where(eq(leads.id, id)).returning();
  return row;
}

export async function setStage(id: string, stage: Stage, nextAction?: string | null, nextActionAt?: Date | null) {
  const row = await update(id, {
    stage,
    nextAction: nextAction ?? null,
    nextActionAt: nextActionAt ?? null,
    // Reopening a closed lead puts it back in front of the daily job.
    closedAt: stage.startsWith('closed') ? new Date() : null,
  });
  await log(id, `stage:${stage}`);
  return row;
}

export async function setNotes(id: string, notes: string) {
  await update(id, { notes });
}

/** The card at the top of the lead: who they are and where they came from. */
export async function setDetails(id: string, d: { name: string; company: string; email: string; source: string; budget: string }) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error('Enter a valid email address.');
  await update(id, {
    name: d.name || null,
    company: d.company || null,
    email: d.email,
    source: d.source || 'referral',
    budget: d.budget || null,
  });
  await log(id, 'details');
}

/** Send, and record. Falls back to a logged "would send" when Gmail isn't connected yet. */
async function send(leadId: string, kind: string, to: string, mail: E.Email, attachments?: Attachment[]) {
  if (!(await gmailConfigured())) {
    await log(leadId, `email:${kind}:skipped`, { to, subject: mail.subject, reason: 'Gmail not connected' });
    return false;
  }
  const res = await sendMail({ to, subject: mail.subject, text: mail.text, attachments });
  await log(leadId, `email:${kind}`, { to, subject: mail.subject, gmailId: res.id, threadId: res.threadId });
  return true;
}

async function draft(leadId: string, kind: string, to: string, mail: E.Email) {
  if (!(await gmailConfigured())) {
    await log(leadId, `draft:${kind}:skipped`, { to, reason: 'Gmail not connected' });
    return false;
  }
  const res = await draftMail({ to, subject: mail.subject, text: mail.text });
  await log(leadId, `draft:${kind}`, { to, subject: mail.subject, draftId: res.id });
  return true;
}

/* ── Stage 1: inquiry ──────────────────────────────────────────────────── */

export async function createLead(input: {
  name?: string | null;
  company?: string | null;
  email: string;
  message?: string | null;
  budget?: string | null;
  source?: string;
}) {
  const [lead] = await db
    .insert(leads)
    .values({
      name: input.name?.trim() || null,
      company: input.company?.trim() || null,
      email: input.email.trim().toLowerCase(),
      message: input.message?.trim() || null,
      budget: input.budget || null,
      source: input.source ?? 'contact form',
      stage: 'new',
      nextAction: 'Reply with Email A',
      nextActionAt: addBusinessDays(new Date(), 1),
    })
    .returning();
  await log(lead.id, 'inquiry', { message: lead.message, budget: lead.budget });
  return lead;
}

/**
 * Email A: the reply with the booking link. The "about ___" phrase is written
 * from their message (lib/summarize.ts) unless one is given.
 */
export async function sendEmailA(id: string, topic?: string) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  let t = topic?.trim();
  if (!t) {
    const gist = await gistOf(lead.message);
    t = gist.topic;
    if (gist.summary) await update(id, { summary: gist.summary });
  }
  const ok = await send(id, 'A', lead.email, E.emailA({ name: lead.name, topic: t, calLink: calLink(), signer: signer() }));
  await update(id, { nextAction: 'Nudge if no booking', nextActionAt: addBusinessDays(new Date(), 3) });
  return ok;
}

export async function sendEmailA2(id: string) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  const ok = await send(id, 'A2', lead.email, E.emailA2({ name: lead.name, calLink: calLink(), signer: signer() }));
  await update(id, { nextAction: 'Close lost if still no reply', nextActionAt: addDays(new Date(), 7) });
  return ok;
}

/* ── Stage 2: the call ─────────────────────────────────────────────────── */

export async function bookCall(id: string, startAt: Date, endAt?: Date | null) {
  await update(id, { callAt: startAt });
  await setStage(id, 'call_booked', 'Send the recap (Email B) after the call', endAt ?? startAt);
}

/** Cal.com webhook: match the attendee to the newest open lead, or create one. */
export async function handleCalBooking(email: string, name: string | null, startAt: Date, endAt: Date | null) {
  const e = email.toLowerCase();
  const open = await db
    .select()
    .from(leads)
    .where(and(eq(leads.email, e), inArray(leads.stage, ['new', 'call_booked'])))
    .orderBy(desc(leads.createdAt))
    .limit(1);
  let lead = open[0];
  const fresh = !lead;
  if (!lead) lead = await createLead({ name, email: e, source: 'cal.com' });
  await log(lead.id, 'webhook:cal:booking', { startAt, endAt });
  await bookCall(lead.id, startAt, endAt);
  if (fresh) await notifyNewLead(lead, { emailASent: false });
  return lead;
}

/* ── Stage 3: recap + questionnaire ────────────────────────────────────── */

export async function ensureQuestionnaireToken(id: string) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  if (lead.questionnaireToken) return lead.questionnaireToken;
  const t = token();
  await update(id, { questionnaireToken: t });
  return t;
}

export const questionnaireLink = (t: string) => `${siteUrl()}/q/${t}`;

/*
 * Before the client returns the questionnaire, the lead's questionnaire
 * field holds what we typed on the call. Keys starting with "_" are ours
 * (the call notes) and never reach the client.
 */
export const CALL_NOTES = '_call_notes';
/** The recap draft as last edited, so it survives a reload. Bullets, package kind, range and timeline. */
export const RECAP_KEYS = ['_recap_b1', '_recap_b2', '_recap_b3', '_recap_b4', '_recap_kind', '_recap_range', '_recap_weeks'] as const;
const isPrivate = (k: string) => k.startsWith('_');

export function clientPrefill(q: Questionnaire | null | undefined): Questionnaire {
  return Object.fromEntries(Object.entries(q ?? {}).filter(([k]) => !isPrivate(k)));
}

function privatePart(q: Questionnaire | null | undefined): Questionnaire {
  return Object.fromEntries(Object.entries(q ?? {}).filter(([k]) => isPrivate(k)));
}

/** Autosave from the call: the answers and notes as typed so far. */
export async function saveCallAnswers(id: string, answers: Questionnaire) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  if (lead.questionnaireAt) throw new Error('The client has already returned the questionnaire.');
  await update(id, { questionnaire: Object.keys(answers).length ? answers : null });
}

export async function sendRecap(
  id: string,
  o: { bullets: string[]; packageLabel: string; range: string; weeks: string; prefill?: Questionnaire },
) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  const t = await ensureQuestionnaireToken(id);
  // Answers we already have from the call start the questionnaire off; the client can change them.
  if (!lead.questionnaireAt) {
    const merged = { ...privatePart(lead.questionnaire), ...o.prefill };
    await update(id, { questionnaire: Object.keys(merged).length ? merged : null });
  }
  const ok = await send(
    id,
    'B',
    lead.email,
    E.emailB({ ...o, prefilled: Boolean(o.prefill && Object.keys(o.prefill).length), name: lead.name, questionnaireLink: questionnaireLink(t), signer: signer() }),
  );
  await setStage(id, 'recap_sent', 'Nudge for the questionnaire', addBusinessDays(new Date(), 5));
  return ok;
}

export async function leadByQuestionnaireToken(t: string) {
  return db.query.leads.findFirst({ where: eq(leads.questionnaireToken, t) });
}

export async function submitQuestionnaire(t: string, answers: Questionnaire) {
  const lead = await leadByQuestionnaireToken(t);
  if (!lead) throw new Error('This link is not valid.');
  await update(lead.id, {
    // Their answers replace our pre-fill; our call notes stay.
    questionnaire: { ...privatePart(lead.questionnaire), ...answers },
    questionnaireAt: new Date(),
    nextAction: 'Build the quote and send the proposal',
    nextActionAt: addBusinessDays(new Date(), 2),
    ...(answers.company && !lead.company ? { company: answers.company } : {}),
  });
  await log(lead.id, 'questionnaire', { answered: Object.keys(answers).length });
  await notifyStudio(lead, 'Questionnaire in', `${Object.keys(answers).length} answers. The quote is due within two business days.`);
  await checkKickoff(lead.id);
  return lead;
}

/* ── Stage 4: quote + proposal ─────────────────────────────────────────── */

export async function saveQuote(id: string, quote: QuoteInput) {
  await update(id, {
    quote,
    ...(quote.client ? { company: quote.client } : {}),
  });
  await log(id, 'quote:saved', { total: computeQuote(quote).total });
}

export const proposalLink = (t: string) => `${siteUrl()}/p/${t}`;

/** The lead's saved quote with the lead's own email and company filled in. */
export function leadQuote(lead: Lead): QuoteInput | null {
  if (!lead.quote) return null;
  return { ...lead.quote, email: lead.email, client: lead.quote.client || lead.company || '' };
}

/** The proposal as it would be sent now: the saved quote with the lead's wording edits. */
export function leadProposalDoc(lead: Lead, now = new Date()) {
  const quote = leadQuote(lead);
  if (!quote) return null;
  return buildProposal(computeQuote(quote), now, lead.proposalEdits);
}

/** Wording changes from the studio editor. Null clears them. */
export async function saveProposalEdits(id: string, edits: ProposalEdits | null) {
  await update(id, { proposalEdits: hasEdits(edits) ? edits : null });
  await log(id, edits ? 'proposal:edited' : 'proposal:edits-cleared', edits ? { blocks: Object.keys(edits.blocks ?? {}).length, extra: Object.keys(edits.extra ?? {}).length } : undefined);
}

export async function createAndSendProposal(id: string) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  const quote = leadQuote(lead);
  if (!quote) throw new Error('Save a quote for this lead first (open the estimator from this page).');
  const q = computeQuote(quote);

  // One live proposal at a time: anything older still unsigned is voided.
  await db
    .update(proposals)
    .set({ status: 'void' })
    .where(and(eq(proposals.leadId, id), inArray(proposals.status, ['draft', 'sent', 'expired'])));

  const now = new Date();
  const [p] = await db
    .insert(proposals)
    .values({
      leadId: id,
      token: token(),
      quote,
      priced: q,
      edits: hasEdits(lead.proposalEdits) ? lead.proposalEdits : null,
      sentAt: now,
      expiresAt: addDays(now, PROPOSAL_VALID_DAYS),
      status: 'sent',
    })
    .returning();

  const ok = await send(
    id,
    'C',
    lead.email,
    E.emailC({
      name: lead.name,
      company: quote.client || 'your project',
      q,
      proposalLink: proposalLink(p.token),
      validUntil: p.expiresAt,
      calLink: calLink(),
      signer: signer(),
    }),
  );
  await setStage(id, 'proposal_sent', 'Nudge, day 5', addDays(now, 5));
  return { proposal: p, sent: ok };
}

export async function proposalByToken(t: string) {
  return db.query.proposals.findFirst({ where: eq(proposals.token, t) });
}

export async function markProposalViewed(p: Proposal) {
  if (p.viewedAt) return;
  await db.update(proposals).set({ viewedAt: new Date() }).where(eq(proposals.id, p.id));
  await log(p.leadId, 'proposal:viewed');
}

/** The quote as it was priced when sent. Proposals from before `priced` existed are recomputed. */
export function proposalQuote(p: Proposal) {
  return p.priced ?? computeQuote(p.quote);
}

/** The document as sent: the frozen quote and the frozen wording edits. */
export function proposalDoc(p: Proposal) {
  return buildProposal(proposalQuote(p), p.createdAt, p.edits);
}

/* ── Stage 5: signature → deposit ──────────────────────────────────────── */

export async function signProposal(t: string, s: { name: string; email: string; ip: string; ua: string }) {
  const p = await proposalByToken(t);
  if (!p) throw new Error('This proposal link is not valid.');
  if (p.status === 'signed') throw new Error('This proposal has already been signed.');
  if (p.status === 'void') throw new Error('This proposal has been replaced. Check your email for the current one.');
  if (p.expiresAt.getTime() < Date.now()) throw new Error('This proposal has expired. Reply to our email and we will re-quote.');
  const lead = await getLead(p.leadId);
  if (!lead) throw new Error('No such lead.');

  const doc = proposalDoc(p);
  const unsigned = await renderProposalPdf(doc);
  const docHash = createHash('sha256').update(unsigned).digest('hex');
  const signedAt = new Date();

  const [signed] = await db
    .update(proposals)
    .set({ status: 'signed', signedAt, signerName: s.name, signerEmail: s.email, signerIp: s.ip, signerUa: s.ua, docHash })
    .where(and(eq(proposals.id, p.id), ne(proposals.status, 'signed')))
    .returning();
  if (!signed) throw new Error('This proposal has already been signed.');
  await log(lead.id, 'proposal:signed', { signerName: s.name, signerEmail: s.email, ip: s.ip, docHash });

  const pdf = await renderProposalPdf(doc, {
    signerName: s.name,
    signerEmail: s.email,
    signedAt,
    ip: s.ip,
    userAgent: s.ua,
    docHash,
    studioSigner: process.env.OCE_LEGAL_NAME || 'OCE Labs',
  });
  const attachment: Attachment = { filename: proposalFileName(doc.client).replace(/\.pdf$/, '-signed.pdf'), contentType: 'application/pdf', data: pdf };

  // Payment schedule from the signed quote; the deposit goes out now.
  const q = proposalQuote(p);
  await db.delete(payments).where(and(eq(payments.leadId, lead.id), eq(payments.status, 'scheduled')));

  // Paid ahead of signing (an invoice made by hand): bill only what's left, at launch.
  const paidRows = await db.select().from(payments).where(and(eq(payments.leadId, lead.id), eq(payments.status, 'paid')));
  const paidSum = paidRows.reduce((sum, r) => sum + r.amount, 0);
  if (paidSum > 0) {
    await db.update(payments).set({ proposalId: p.id }).where(and(eq(payments.leadId, lead.id), eq(payments.status, 'paid')));
    const balance = Math.max(0, q.total - paidSum);
    if (balance > 0) {
      const last = q.payments[q.payments.length - 1];
      await db.insert(payments).values({
        leadId: lead.id,
        proposalId: p.id,
        stageIndex: Math.max(...paidRows.map((r) => r.stageIndex)) + 1,
        label: 'Balance',
        pct: Math.round((balance / q.total) * 100),
        amount: balance,
        trigger: last.trigger,
        dueDays: last.dueDays,
        status: 'scheduled',
      });
    }
    await log(lead.id, 'payments:paid-ahead', { paid: paidSum, balance });
    const to = [lead.email, s.email.toLowerCase()].filter((e, i, a) => a.indexOf(e) === i).join(', ');
    await send(lead.id, 'D', to, E.emailD({ name: lead.name, depositAmount: 0, paidAlready: paidSum, balance, questionnaireDone: Boolean(lead.questionnaireAt), folderLink: process.env.CLIENT_FOLDER_LINK, signer: signer() }), [attachment]);
    await notifyStudio(lead, 'Proposal signed', `Signed by ${s.name} <${s.email}>. ${usd.format(paidSum)} was already paid, so no invoice went out.${balance > 0 ? ` The ${usd.format(balance)} balance is scheduled for launch.` : ''}`);
    await setStage(lead.id, 'signed', 'Chase the kickoff items', addBusinessDays(signedAt, 3));
    await checkKickoff(lead.id);
    return { proposal: signed, pdf, invoiceError: null };
  }

  const rows = await db
    .insert(payments)
    .values(
      q.payments.map((pay, i) => ({
        leadId: lead.id,
        proposalId: p.id,
        stageIndex: i,
        label: pay.label,
        pct: pay.pct,
        amount: pay.amount,
        trigger: pay.trigger,
        dueDays: pay.dueDays,
        status: 'scheduled' as const,
      })),
    )
    .returning();

  let invoiceError: string | null = null;
  try {
    await sendPayment(lead, rows[0], p.quote);
  } catch (e) {
    invoiceError = e instanceof Error ? e.message : 'Stripe failed';
    await log(lead.id, 'invoice:error', { stage: 0, error: invoiceError });
  }

  // The signed copy goes to the lead and, if they typed a different one, the signer.
  const to = [lead.email, s.email.toLowerCase()].filter((e, i, a) => a.indexOf(e) === i).join(', ');
  await send(lead.id, 'D', to, E.emailD({ name: lead.name, depositAmount: rows[0].amount, full: rows.length === 1, questionnaireDone: Boolean(lead.questionnaireAt), folderLink: process.env.CLIENT_FOLDER_LINK, signer: signer() }), [attachment]);
  await notifyStudio(lead, 'Proposal signed', `Signed by ${s.name} <${s.email}>. ${invoiceError ? `The deposit invoice failed: ${invoiceError}` : 'The deposit invoice went out through Stripe.'}`);
  await setStage(lead.id, 'signed', invoiceError ? `Deposit invoice failed: ${invoiceError}` : 'Chase the kickoff items', addBusinessDays(signedAt, 3));
  return { proposal: signed, pdf, invoiceError };
}

/** Create and send one scheduled payment as a Stripe invoice. */
export async function sendPayment(lead: Lead, pay: Payment, quote: QuoteInput, extras: Array<{ label: string; amount: number }> = []) {
  if (pay.status !== 'scheduled') throw new Error(`Payment "${pay.label}" was already ${pay.status}.`);
  // Describe the invoice from the signed proposal, not today's price book.
  const signedP = pay.proposalId ? await db.query.proposals.findFirst({ where: eq(proposals.id, pay.proposalId) }) : null;
  const q = signedP ? proposalQuote(signedP) : computeQuote(quote);
  const customer = await findOrCreateCustomer(lead.email, quote.client || lead.company || lead.name);
  const invoice = await createDraftInvoice({
    customer,
    amount: pay.amount,
    line: `${q.pkg.label}${quote.client ? ` for ${quote.client}` : ''}: ${pay.label.toLowerCase()} (${pay.pct}%)`,
    memo: `${pay.label}, ${pay.pct}% of ${usd.format(q.total)}. ${pay.trigger}.`,
    dueDays: pay.dueDays,
    metadata: { lead: lead.id, stage: String(pay.stageIndex), package: q.pkg.label },
  });
  for (const x of extras) {
    await stripe('/invoiceitems', { customer, invoice: invoice.id, currency: 'usd', amount: String(Math.round(x.amount * 100)), description: x.label });
  }
  const sent = await finalizeAndSend(invoice.id);
  await db
    .update(payments)
    .set({ status: 'sent', stripeInvoiceId: sent.id, stripeUrl: dashboardUrl(sent), sentAt: new Date() })
    .where(eq(payments.id, pay.id));
  await log(lead.id, 'invoice:sent', { stage: pay.stageIndex, label: pay.label, amount: pay.amount, invoice: sent.id, extras });
  return sent;
}

/** The fields of a Stripe invoice the webhook needs. */
export type PaidInvoice = {
  id: string;
  livemode?: boolean;
  amount_paid?: number;
  customer_email?: string | null;
  billing_reason?: string | null;
  metadata?: Record<string, string> | null;
};

/** Stripe webhook: invoice.paid. */
export async function handleInvoicePaid(inv: PaidInvoice) {
  const pay = await db.query.payments.findFirst({ where: eq(payments.stripeInvoiceId, inv.id) });
  if (!pay) return recordHandInvoice(inv);
  if (pay.status === 'paid') return null;
  await db.update(payments).set({ status: 'paid', paidAt: new Date() }).where(eq(payments.id, pay.id));
  await log(pay.leadId, 'invoice:paid', { stage: pay.stageIndex, label: pay.label, amount: pay.amount });
  if (pay.stageIndex === 0) await checkKickoff(pay.leadId);
  return pay;
}

/**
 * A paid invoice we didn't schedule: one made by hand, from the estimator or
 * the Stripe dashboard. Matched to its lead by the invoice's lead tag, else
 * by the client's email, and recorded as paid so the lead knows it's in.
 * Retainer invoices are subscriptions and are left alone.
 */
async function recordHandInvoice(inv: PaidInvoice) {
  if (inv.billing_reason && inv.billing_reason !== 'manual') return null;
  const amount = Math.round((inv.amount_paid ?? 0) / 100);
  if (amount <= 0) return null;

  let lead = inv.metadata?.lead ? await getLead(inv.metadata.lead) : undefined;
  if (!lead && inv.customer_email) {
    lead = await db.query.leads.findFirst({ where: eq(leads.email, inv.customer_email.toLowerCase()), orderBy: desc(leads.createdAt) });
  }
  if (!lead) return null;

  const existing = await db.select().from(payments).where(eq(payments.leadId, lead.id));
  const p = await db.query.proposals.findFirst({
    where: and(eq(proposals.leadId, lead.id), ne(proposals.status, 'void')),
    orderBy: desc(proposals.createdAt),
  });
  const total = p ? proposalQuote(p).total : lead.quote ? computeQuote(lead.quote).total : 0;
  const [row] = await db
    .insert(payments)
    .values({
      leadId: lead.id,
      proposalId: p?.id ?? null,
      stageIndex: existing.length ? Math.max(...existing.map((r) => r.stageIndex)) + 1 : 0,
      label: 'Payment, invoiced by hand',
      pct: total ? Math.round((amount / total) * 100) : 0,
      amount,
      trigger: 'Invoiced outside the proposal schedule',
      dueDays: 0,
      status: 'paid',
      stripeInvoiceId: inv.id,
      stripeUrl: dashboardUrl({ id: inv.id, livemode: Boolean(inv.livemode) }),
      sentAt: new Date(),
      paidAt: new Date(),
    })
    .returning();
  await log(lead.id, 'invoice:paid', { stage: row.stageIndex, label: row.label, amount, invoice: inv.id, byHand: true });
  const unsigned = p?.status !== 'signed';
  await notifyStudio(
    lead,
    'Payment in',
    `${usd.format(amount)} paid on a Stripe invoice made outside the proposal. It's recorded on this lead.` +
      (unsigned ? ' The proposal isn\u2019t signed yet; ask them to sign it. Signing won\u2019t bill them again.' : ''),
  );
  if (row.stageIndex === 0) await checkKickoff(lead.id);
  return row;
}

/* ── Stage 6: kickoff ──────────────────────────────────────────────────── */

export async function markBrandFiles(id: string) {
  await update(id, { brandFilesAt: new Date() });
  await log(id, 'kickoff:brand-files');
  await checkKickoff(id);
}

export async function markCopy(id: string) {
  await update(id, { copyAt: new Date() });
  await log(id, 'kickoff:copy');
  await checkKickoff(id);
}

/** When all four items are in, kickoff happens by itself. */
export async function checkKickoff(id: string) {
  const lead = await getLead(id);
  if (!lead || lead.kickoffAt || !lead.quote) return false;
  if (!lead.questionnaireAt || !lead.brandFilesAt || !lead.copyAt) return false;
  const deposit = await db.query.payments.findFirst({ where: and(eq(payments.leadId, id), eq(payments.stageIndex, 0)) });
  if (!deposit || deposit.status !== 'paid') return false;

  const q = computeQuote(lead.quote);
  const kickoff = new Date();
  const days = q.weeks[1] * 7; // the high end: a date in writing should be one we can keep
  const launch = addDays(kickoff, days);
  const company = lead.quote.client || lead.company || 'your project';
  await update(id, { kickoffAt: kickoff, launchAt: launch });
  await send(
    id,
    'E',
    lead.email,
    E.emailE({
      name: lead.name,
      company,
      kickoff,
      launch,
      contentDeadline: addDays(kickoff, CONTENT_DEADLINE_DAYS),
      designReview: addDays(kickoff, Math.round(days * 0.35)),
      stagingReview: addDays(kickoff, Math.round(days * 0.85)),
      signer: signer(),
    }),
  );
  await setStage(id, 'building', 'Friday update', nextFriday(kickoff));
  return true;
}

function nextFriday(from: Date) {
  const d = new Date(from);
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  d.setHours(9, 0, 0, 0);
  return d;
}

/* ── Stage 7: build ────────────────────────────────────────────────────── */

export async function approveDesign(id: string) {
  const lead = await getLead(id);
  if (!lead || !lead.quote) throw new Error('No quote on this lead.');
  await update(id, { designApprovedAt: new Date() });
  await log(id, 'review:design-approved');
  // Web App: the 30% design-approved payment goes out now.
  const mid = await db.query.payments.findFirst({
    where: and(eq(payments.leadId, id), eq(payments.status, 'scheduled'), eq(payments.label, 'Design approved')),
  });
  if (mid) await sendPayment(lead, mid, lead.quote);
}

export async function approveStaging(id: string, extras: Array<{ label: string; amount: number }> = []) {
  const lead = await getLead(id);
  if (!lead || !lead.quote) throw new Error('No quote on this lead.');
  await update(id, { stagingApprovedAt: new Date() });
  await log(id, 'review:staging-approved', { extras });
  const remaining = await db
    .select()
    .from(payments)
    .where(and(eq(payments.leadId, id), eq(payments.status, 'scheduled')))
    .orderBy(payments.stageIndex);
  const final = remaining[remaining.length - 1];
  let amount = 0;
  if (final) {
    // Any earlier unsent milestones fold into the final invoice.
    const earlier = remaining.slice(0, -1);
    for (const e of earlier) {
      await db.update(payments).set({ status: 'void' }).where(eq(payments.id, e.id));
    }
    const folded = earlier.map((e) => ({ label: `${e.label} (${e.pct}%)`, amount: e.amount }));
    amount = final.amount + earlier.reduce((s, e) => s + e.amount, 0) + extras.reduce((s, x) => s + x.amount, 0);
    await sendPayment(lead, final, lead.quote, [...folded, ...extras]);
  }
  const company = lead.quote.client || lead.company || 'your site';
  await send(id, 'G', lead.email, E.emailG({ name: lead.name, company, amount, changeOrders: extras.map((x) => `${x.label}, ${usd.format(x.amount)}`).join('; ') || null, signer: signer() }));
  await setStage(id, 'review', 'Go live when the final invoice is paid', null);
}

/* ── Stages 8–10: launch, handover, day 30 ─────────────────────────────── */

export async function markLaunched(id: string, o: { domain: string; analyticsLink?: string; repoLink?: string; hostingLink?: string; searchConsoleLink?: string }) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  const now = new Date();
  const until = addDays(now, lead.quote ? warrantyDays(lead.quote.kind) : WARRANTY_DAYS);
  await update(id, { domain: o.domain, handoverAt: now, launchAt: now });
  await send(id, 'H', lead.email, E.emailH({ ...o, name: lead.name, until, signer: signer() }));
  await setStage(id, 'launched', 'Day-30 email (drafted for you)', until);
}

/* ── Retainer ──────────────────────────────────────────────────────────── */

/** Monthly subscription in Stripe, invoiced by email; confirmation email to the client. */
export async function startRetainer(id: string, monthly: number, startAt: Date) {
  const lead = await getLead(id);
  if (!lead) throw new Error('No such lead.');
  if (lead.retainerSubId && lead.retainerStatus === 'active') throw new Error('This client already has an active retainer.');
  if (!(monthly > 0)) throw new Error('Enter a monthly price.');
  const customer = await findOrCreateCustomer(lead.email, lead.quote?.client || lead.company || lead.name);
  const sub = await createRetainer({
    customer,
    monthly,
    startAt,
    label: `Monthly retainer${lead.domain ? ` for ${lead.domain}` : ''}`,
    metadata: { lead: lead.id },
  });
  await update(id, { retainerMonthly: Math.round(monthly), retainerSubId: sub.id, retainerStartAt: startAt, retainerStatus: 'active' });
  await log(id, 'retainer:started', { monthly, startAt, subscription: sub.id });
  await send(id, 'J', lead.email, E.emailJ({ name: lead.name, domain: lead.domain, monthly, startAt, signer: signer() }));
  if (!lead.closedAt) await setStage(id, 'closed_won');
  return sub;
}

export async function stopRetainer(id: string) {
  const lead = await getLead(id);
  if (!lead?.retainerSubId) throw new Error('No retainer on this lead.');
  const sub = await endRetainer(lead.retainerSubId) as { cancel_at?: number; current_period_end?: number; items?: { data?: Array<{ current_period_end?: number }> } };
  const endTs = sub.cancel_at ?? sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  const until = endTs ? new Date(endTs * 1000) : new Date();
  await update(id, { retainerStatus: 'ending' });
  await log(id, 'retainer:cancelled', { until });
  await send(id, 'Jend', lead.email, E.emailJEnd({ name: lead.name, until, signer: signer() }));
  return until;
}

/** Stripe webhook: the subscription has actually ended. */
export async function handleRetainerEnded(subId: string) {
  const lead = await db.query.leads.findFirst({ where: eq(leads.retainerSubId, subId) });
  if (!lead) return;
  await update(lead.id, { retainerStatus: 'ended' });
  await log(lead.id, 'retainer:ended');
}

export const retainerDashboard = (subId: string) =>
  `https://dashboard.stripe.com/${stripeLive() ? '' : 'test/'}subscriptions/${subId}`;

export async function closeLead(id: string, won: boolean) {
  await setStage(id, won ? 'closed_won' : 'closed_lost');
}

/* ── The daily job ─────────────────────────────────────────────────────── */

export type CronReport = string[];

export async function runDaily(now = new Date()): Promise<CronReport> {
  const out: CronReport = [];
  const open = await db.select().from(leads).where(and(isNull(leads.closedAt)));

  for (const lead of open) {
    try {
      if (lead.stage === 'new') {
        const aSent = await hasEvent(lead.id, 'email:A');
        const a2Sent = await hasEvent(lead.id, 'email:A2');
        if (aSent && !a2Sent && addBusinessDays(lead.createdAt, 3) <= now) {
          await sendEmailA2(lead.id);
          out.push(`A2 → ${lead.email}`);
        } else if (a2Sent) {
          const a2 = await db.query.events.findFirst({ where: and(eq(events.leadId, lead.id), eq(events.kind, 'email:A2')) });
          if (a2 && addDays(a2.at, 7) <= now) {
            await closeLead(lead.id, false);
            out.push(`closed lost (no reply) ${lead.email}`);
          }
        }
      }

      if (lead.stage === 'recap_sent' && !lead.questionnaireAt && lead.questionnaireToken) {
        const nudged = await hasEvent(lead.id, 'email:Qnudge');
        const b = await db.query.events.findFirst({ where: and(eq(events.leadId, lead.id), eq(events.kind, 'email:B')) });
        if (!nudged && b && addBusinessDays(b.at, 5) <= now) {
          await send(lead.id, 'Qnudge', lead.email, E.emailQuestionnaireNudge({ name: lead.name, questionnaireLink: questionnaireLink(lead.questionnaireToken), signer: signer() }));
          await update(lead.id, { nextAction: 'Questionnaire still out', nextActionAt: addBusinessDays(now, 5) });
          out.push(`questionnaire nudge → ${lead.email}`);
        }
      }

      if (lead.stage === 'proposal_sent') {
        const p = await db.query.proposals.findFirst({
          where: and(eq(proposals.leadId, lead.id), eq(proposals.status, 'sent')),
          orderBy: desc(proposals.createdAt),
        });
        if (p && p.sentAt) {
          const age = (now.getTime() - p.sentAt.getTime()) / DAY;
          if (age >= PROPOSAL_VALID_DAYS) {
            await db.update(proposals).set({ status: 'expired' }).where(eq(proposals.id, p.id));
            await update(lead.id, { nextAction: 'Proposal expired: re-quote or close', nextActionAt: now });
            await log(lead.id, 'proposal:expired');
            out.push(`proposal expired ${lead.email}`);
          } else if (age >= 12 && !(await hasEvent(lead.id, 'email:C12'))) {
            await send(lead.id, 'C12', lead.email, E.emailCNudge({ name: lead.name, company: p.quote.client || lead.company || 'your project', proposalLink: proposalLink(p.token), validUntil: p.expiresAt, last: true, signer: signer() }));
            await update(lead.id, { nextAction: 'Proposal expires', nextActionAt: p.expiresAt });
            out.push(`C day-12 → ${lead.email}`);
          } else if (age >= 5 && !(await hasEvent(lead.id, 'email:C5'))) {
            await send(lead.id, 'C5', lead.email, E.emailCNudge({ name: lead.name, company: p.quote.client || lead.company || 'your project', proposalLink: proposalLink(p.token), validUntil: p.expiresAt, last: false, signer: signer() }));
            await update(lead.id, { nextAction: 'Nudge, day 12', nextActionAt: addDays(p.sentAt, 12) });
            out.push(`C day-5 → ${lead.email}`);
          }
        }
      }

      if ((lead.stage === 'building' || lead.stage === 'review') && now.getDay() === 5 && lead.kickoffAt) {
        const week = Math.max(1, Math.ceil((now.getTime() - lead.kickoffAt.getTime()) / (7 * DAY)));
        const kind = `F:${week}`;
        if (!(await hasEvent(lead.id, `draft:${kind}`))) {
          const company = lead.quote?.client || lead.company || 'your project';
          await draft(lead.id, kind, lead.email, E.emailF({ name: lead.name, company, week, launch: lead.launchAt, signer: signer() }));
          await update(lead.id, { nextAction: `Send the week ${week} update (drafted)`, nextActionAt: now });
          out.push(`F week ${week} drafted for ${lead.email}`);
        }
      }

      if (lead.stage === 'launched' && lead.handoverAt && addDays(lead.handoverAt, lead.quote ? warrantyDays(lead.quote.kind) : WARRANTY_DAYS) <= now && !(await hasEvent(lead.id, 'draft:I'))) {
        await draft(lead.id, 'I', lead.email, E.emailI({ name: lead.name, domain: lead.domain || 'the site', monthly: lead.quote ? computeQuote(lead.quote).monthly || null : null, signer: signer() }));
        await update(lead.id, { nextAction: 'Send the day-30 email (drafted), then close', nextActionAt: now });
        out.push(`I drafted for ${lead.email}`);
      }
    } catch (e) {
      out.push(`ERROR ${lead.email}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return out;
}

/* ── Summaries for the studio UI ───────────────────────────────────────── */

export function quoteSummary(quote: QuoteInput | null) {
  if (!quote) return null;
  const q = computeQuote(quote);
  return { total: usd.format(q.total), pkg: q.pkg.label, weeks: weeksLabel(q.weeks), deposit: usd.format(q.payments[0].amount) };
}

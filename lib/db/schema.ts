/*
 * The studio's data: one row per lead, the things that happen to it, the
 * proposals it signs, and the payments those create. This replaces the
 * Notion/Sheets tracker from the workflow doc; the stages are the same.
 */

import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type { QuoteInput } from '@/lib/pricing';

export const STAGES = [
  'new',
  'call_booked',
  'recap_sent',
  'proposal_sent',
  'signed',
  'kickoff',
  'building',
  'review',
  'launched',
  'closed_won',
  'closed_lost',
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  new: 'New',
  call_booked: 'Call booked',
  recap_sent: 'Recap sent',
  proposal_sent: 'Proposal sent',
  signed: 'Signed',
  kickoff: 'Kickoff',
  building: 'Building',
  review: 'Review',
  launched: 'Launched',
  closed_won: 'Closed, won',
  closed_lost: 'Closed, lost',
};

/** The 16 questionnaire answers, keyed q1..q16, plus who filled it. */
export type Questionnaire = Record<string, string>;

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  name: text('name'),
  company: text('company'),
  email: text('email').notNull(),
  source: text('source').notNull().default('contact form'),
  message: text('message'),
  /** One line from lib/summarize.ts: what they want, for the table and the ping. */
  summary: text('summary'),
  budget: text('budget'),
  stage: text('stage').$type<Stage>().notNull().default('new'),
  nextAction: text('next_action'),
  nextActionAt: timestamp('next_action_at', { withTimezone: true }),
  notes: text('notes'),

  /** The estimator's state for this lead. Saved from /pricing. */
  quote: jsonb('quote').$type<QuoteInput>(),

  questionnaireToken: text('questionnaire_token').unique(),
  questionnaire: jsonb('questionnaire').$type<Questionnaire>(),
  questionnaireAt: timestamp('questionnaire_at', { withTimezone: true }),

  /** Intro call, from the Cal.com webhook or set by hand. */
  callAt: timestamp('call_at', { withTimezone: true }),

  /** The four kickoff items. Deposit lives on payments; these three are ticked by hand. */
  brandFilesAt: timestamp('brand_files_at', { withTimezone: true }),
  copyAt: timestamp('copy_at', { withTimezone: true }),

  kickoffAt: timestamp('kickoff_at', { withTimezone: true }),
  launchAt: timestamp('launch_at', { withTimezone: true }),
  designApprovedAt: timestamp('design_approved_at', { withTimezone: true }),
  stagingApprovedAt: timestamp('staging_approved_at', { withTimezone: true }),
  domain: text('domain'),
  handoverAt: timestamp('handover_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
});

/** Everything that happened to a lead, for the timeline on its page. */
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
  /** e.g. "email:A", "stage:signed", "webhook:stripe:invoice.paid" */
  kind: text('kind').notNull(),
  detail: jsonb('detail').$type<Record<string, unknown>>(),
});

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  /** Public link: /p/<token>. Unguessable. */
  token: text('token').notNull().unique(),
  /** Snapshot of the quote at send time; the lead's quote may move on. */
  quote: jsonb('quote').$type<QuoteInput>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  viewedAt: timestamp('viewed_at', { withTimezone: true }),
  status: text('status').$type<'draft' | 'sent' | 'signed' | 'expired' | 'void'>().notNull().default('draft'),

  /* The e-signature record. Name typed, consent ticked, and the who/when/
     what needed to stand behind it. */
  signedAt: timestamp('signed_at', { withTimezone: true }),
  signerName: text('signer_name'),
  signerEmail: text('signer_email'),
  signerIp: text('signer_ip'),
  signerUa: text('signer_ua'),
  /** sha256 of the unsigned PDF the signer was shown. */
  docHash: text('doc_hash'),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  proposalId: uuid('proposal_id').references(() => proposals.id, { onDelete: 'set null' }),
  /** Index into the quote's payment schedule; 0 is the deposit. */
  stageIndex: integer('stage_index').notNull(),
  label: text('label').notNull(),
  pct: integer('pct').notNull(),
  amount: integer('amount').notNull(),
  trigger: text('trigger').notNull(),
  dueDays: integer('due_days').notNull(),
  status: text('status').$type<'scheduled' | 'sent' | 'paid' | 'void'>().notNull().default('scheduled'),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  stripeUrl: text('stripe_url'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
});

/** Key/value for the few things the app needs to remember about itself. */
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Event = typeof events.$inferSelect;

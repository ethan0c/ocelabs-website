import { STAGES, STAGE_LABEL, type Lead, type Payment } from '@/lib/db/schema';

/*
 * The numbers on the studio dashboard, computed from plain rows so they can
 * be tested without a database. Test leads are filtered out before this runs.
 */

export type Point = { key: string; label: string; value: number };

export type Dashboard = {
  /** New leads per month, oldest first, ending with the current month. */
  leadsByMonth: Point[];
  /** Money that arrived per month, by the day it was paid. */
  paidByMonth: Point[];
  /** Open leads at each stage, in pipeline order. Closed stages are left out. */
  pipeline: Point[];
  open: number;
  dueNow: number;
  won: number;
  lost: number;
  /** Won over won plus lost, or null before anything has closed. */
  winRate: number | null;
  paidTotal: number;
  /** Invoices sent and not yet paid. */
  outstanding: number;
  /** Retainers still running, including ones cancelled but not yet ended. */
  retainers: { count: number; monthly: number };
};

type LeadRow = Pick<Lead, 'createdAt' | 'stage' | 'closedAt' | 'nextActionAt' | 'retainerStatus' | 'retainerMonthly'>;
type PaymentRow = Pick<Payment, 'amount' | 'status' | 'paidAt'>;

const MONTHS = 12;

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function lastMonths(now: Date): Point[] {
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const out: Point[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKey(d), label: fmt.format(d), value: 0 });
  }
  return out;
}

/** Adds to the month `at` falls in; anything older than the window is dropped. */
function tally(points: Point[], at: Date | null | undefined, amount = 1) {
  if (!at) return;
  const p = points.find((m) => m.key === monthKey(at));
  if (p) p.value += amount;
}

export function computeDashboard(leads: LeadRow[], payments: PaymentRow[], now = new Date()): Dashboard {
  const leadsByMonth = lastMonths(now);
  const paidByMonth = lastMonths(now);
  const pipeline: Point[] = STAGES.filter((s) => !s.startsWith('closed')).map((s) => ({ key: s, label: STAGE_LABEL[s], value: 0 }));

  let open = 0;
  let dueNow = 0;
  let won = 0;
  let lost = 0;
  let retainerCount = 0;
  let retainerMonthly = 0;

  for (const l of leads) {
    tally(leadsByMonth, l.createdAt);
    if (l.stage === 'closed_won') won++;
    else if (l.stage === 'closed_lost') lost++;
    if (!l.closedAt) {
      open++;
      if (l.nextActionAt && l.nextActionAt.getTime() <= now.getTime()) dueNow++;
      const row = pipeline.find((p) => p.key === l.stage);
      if (row) row.value++;
    }
    if (l.retainerStatus && l.retainerStatus !== 'ended') {
      retainerCount++;
      retainerMonthly += l.retainerMonthly ?? 0;
    }
  }

  let paidTotal = 0;
  let outstanding = 0;
  for (const p of payments) {
    if (p.status === 'paid') {
      paidTotal += p.amount;
      tally(paidByMonth, p.paidAt, p.amount);
    } else if (p.status === 'sent') {
      outstanding += p.amount;
    }
  }

  return {
    leadsByMonth,
    paidByMonth,
    pipeline,
    open,
    dueNow,
    won,
    lost,
    winRate: won + lost ? won / (won + lost) : null,
    paidTotal,
    outstanding,
    retainers: { count: retainerCount, monthly: retainerMonthly },
  };
}

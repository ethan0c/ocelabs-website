import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDashboard } from './dashboard';

const now = new Date('2026-10-13T12:00:00');
const d = (s: string) => new Date(s);

const leads = [
  // Open, overdue.
  { createdAt: d('2026-10-01T09:00:00'), stage: 'new' as const, closedAt: null, nextActionAt: d('2026-10-10T09:00:00'), retainerStatus: null, retainerMonthly: null },
  // Open, nothing due yet.
  { createdAt: d('2026-09-15T09:00:00'), stage: 'proposal_sent' as const, closedAt: null, nextActionAt: d('2026-10-20T09:00:00'), retainerStatus: null, retainerMonthly: null },
  // Won, on a retainer.
  { createdAt: d('2026-08-02T09:00:00'), stage: 'closed_won' as const, closedAt: d('2026-09-30T09:00:00'), nextActionAt: null, retainerStatus: 'active' as const, retainerMonthly: 150 },
  // Lost, and too old for the monthly chart.
  { createdAt: d('2025-01-05T09:00:00'), stage: 'closed_lost' as const, closedAt: d('2025-02-01T09:00:00'), nextActionAt: null, retainerStatus: null, retainerMonthly: null },
];

const payments = [
  { amount: 2475, status: 'paid' as const, paidAt: d('2026-10-02T09:00:00') },
  { amount: 2475, status: 'sent' as const, paidAt: null },
  { amount: 1000, status: 'void' as const, paidAt: null },
];

test('twelve months ending now, with counts in the right month', () => {
  const r = computeDashboard(leads, payments, now);
  assert.equal(r.leadsByMonth.length, 12);
  assert.equal(r.leadsByMonth[11].key, '2026-10');
  assert.equal(r.leadsByMonth[0].key, '2025-11');
  assert.equal(r.leadsByMonth[11].value, 1);
  assert.equal(r.leadsByMonth[10].value, 1); // September
  assert.equal(r.leadsByMonth[9].value, 1); // August
  // January 2025 is outside the window and must not throw or land anywhere.
  assert.equal(r.leadsByMonth.reduce((n, p) => n + p.value, 0), 3);
});

test('pipeline counts only open leads, in stage order', () => {
  const r = computeDashboard(leads, payments, now);
  assert.deepEqual(
    r.pipeline.map((p) => [p.key, p.value]),
    [['new', 1], ['call_booked', 0], ['recap_sent', 0], ['proposal_sent', 1], ['signed', 0], ['kickoff', 0], ['building', 0], ['review', 0], ['launched', 0]],
  );
});

test('headline numbers', () => {
  const r = computeDashboard(leads, payments, now);
  assert.equal(r.open, 2);
  assert.equal(r.dueNow, 1);
  assert.equal(r.won, 1);
  assert.equal(r.lost, 1);
  assert.equal(r.winRate, 0.5);
  assert.equal(r.paidTotal, 2475);
  assert.equal(r.paidByMonth[11].value, 2475);
  assert.equal(r.outstanding, 2475);
  assert.deepEqual(r.retainers, { count: 1, monthly: 150 });
});

test('empty studio', () => {
  const r = computeDashboard([], [], now);
  assert.equal(r.winRate, null);
  assert.equal(r.open, 0);
  assert.equal(r.leadsByMonth.every((p) => p.value === 0), true);
});

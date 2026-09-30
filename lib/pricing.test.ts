/*
 * Real requests we expect to quote, run through the price book. When a price
 * changes on purpose, update the number here; when one changes by accident,
 * this is where it shows. Run with `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PACKAGES,
  computeQuote,
  decodeInput,
  defaultInput,
  encodeInput,
  type Kind,
  type QuoteInput,
} from './pricing';

const quote = (kind: Kind, patch: Partial<QuoteInput> = {}) => computeQuote({ ...defaultInput(kind), ...patch });
const on = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, 1]));

/* ── Common requests ──────────────────────────────────────────────────── */

test('plumber on Starter with online booking: tool price, tool named', () => {
  const q = quote('starter', { qty: on('booking') });
  assert.equal(q.total, 2000);
  assert.match(q.lines[1].label, /set up with Cal\.com/);
  assert.equal(q.thirdParty.length, 1);
  assert.deepEqual(q.warnings, []);
});

test('salon on Starter: booking, reviews, edit it yourself', () => {
  const q = quote('starter', { qty: on('booking', 'reviews', 'selfedit') });
  assert.equal(q.total, 1500 + 500 + 300 + 400);
  assert.deepEqual(q.warnings, []);
});

test('restaurant on Website: extra menu pages, events, business email', () => {
  const q = quote('website', { pages: 7, qty: on('events', 'email') });
  assert.equal(q.total, 3000 + 2 * 350 + 500 + 250);
});

test('consultant on Website: take payments with Stripe', () => {
  const q = quote('website', { qty: on('payments') });
  assert.equal(q.total, 3750);
  assert.ok(q.thirdParty.includes('Stripe'));
});

test('moving a 100-post blog: four migration units plus copy for 10 pages', () => {
  const q = quote('website', { pages: 10, qty: { migration: 4, copy: 2, cms: 1 } });
  assert.equal(q.total, 3000 + 5 * 350 + 4 * 750 + 2 * 900 + 1500);
});

/* ── Tool or custom ───────────────────────────────────────────────────── */

test('a custom build is ignored below Web App: a website pays the tool price', () => {
  const q = quote('website', { qty: on('booking'), build: { booking: 'custom' } });
  assert.equal(q.total, 3500);
  assert.match(q.lines[1].label, /set up with/);
});

test('Web App with booking and payments built into the product', () => {
  const q = quote('webapp', { qty: on('booking', 'payments'), build: { booking: 'custom', payments: 'custom' } });
  assert.equal(q.total, 12000 + 4000 + 4500);
  assert.deepEqual(q.thirdParty, []);
  assert.match(q.lines[1].label, /built custom/);
});

test('Web App can still use a tool, and the client pays for it', () => {
  const q = quote('webapp', { qty: on('booking') });
  assert.equal(q.total, 12500);
  assert.equal(q.thirdParty.length, 1);
});

test('two direct API integrations on a Web App', () => {
  const q = quote('webapp', { qty: { integration: 2 }, build: { integration: 'custom' } });
  assert.equal(q.total, 12000 + 2 * 2000);
});

test('included features cost nothing, whatever the build', () => {
  const q = quote('webapp', { qty: on('cms', 'accounts', 'dashboard') });
  assert.equal(q.total, 12000);
});

/* ── Wrong package ────────────────────────────────────────────────────── */

test('Starter with an online store is flagged: quote the Website Package', () => {
  const q = quote('starter', { qty: on('shop') });
  assert.equal(q.total, 4500);
  assert.match(q.warnings.join(' '), /Website Package/);
});

test('a website with members, booking and payments is flagged as a web app', () => {
  const q = quote('website', { qty: on('membership', 'booking', 'payments') });
  assert.match(q.warnings.join(' '), /web app/);
});

test('store plus payments is flagged as overlapping', () => {
  const q = quote('website', { qty: on('shop', 'payments') });
  assert.match(q.warnings.join(' '), /already takes payments/);
});

test('25 pages on a five-page package is flagged', () => {
  const q = quote('website', { pages: 25 });
  assert.match(q.warnings.join(' '), /more than twice/);
});

test('a calculator without written rules is flagged', () => {
  assert.equal(quote('brand', { qty: on('calculator') }).warnings.length, 1);
  assert.equal(quote('brand', { qty: on('calculator'), notes: 'Three inputs: area, finish, rush.' }).warnings.length, 0);
});

/* ── Unusual requests ─────────────────────────────────────────────────── */

test('something not in the price book goes on as a priced line', () => {
  const q = quote('brand', { extras: [{ label: 'Product photography day, arranged with our photographer', amount: 1800 }] });
  assert.equal(q.total, 7800);
  assert.equal(q.lines[1].label, 'Product photography day, arranged with our photographer');
});

test('blank or zero extra lines are ignored', () => {
  const q = quote('website', { extras: [{ label: '', amount: 500 }, { label: 'Nothing', amount: 0 }] });
  assert.equal(q.total, 3000);
});

test('two sites on one engagement: extras count toward the second site too', () => {
  const q = quote('website', { projects: 2, extras: [{ label: 'Product entry, 80 items', amount: 1000 }] });
  // (3000 + 1000) + 60% of that, then 10% bulk.
  assert.equal(q.subtotal, 6400);
  assert.equal(q.total, 5760);
});

test('AI assistant on a brand site, priced per feature', () => {
  assert.equal(quote('brand', { qty: { ai: 2 } }).total, 6000 + 12000);
});

/* ── Rush ─────────────────────────────────────────────────────────────── */

test('rush always shortens the timeline it charges for', () => {
  for (const kind of Object.keys(PACKAGES) as Kind[]) {
    const base = quote(kind);
    const fast = quote(kind, { rush: 'fast' });
    assert.ok(fast.weeks[1] < base.weeks[1], `${kind}: faster is not shorter`);
    assert.equal(fast.rushPct, 25);
  }
});

test('the fastest option is not offered where it cannot be kept', () => {
  for (const kind of ['starter', 'webapp', 'mobile'] as Kind[]) {
    const q = quote(kind, { rush: 'urgent' });
    assert.equal(q.rushAmt, 0, kind);
    assert.deepEqual(q.weeks, PACKAGES[kind].weeks, kind);
  }
  const w = quote('website', { rush: 'urgent' });
  assert.deepEqual(w.weeks, [2, 3]);
  assert.equal(w.total, 4500);
});

/* ── Money and old quotes ─────────────────────────────────────────────── */

test('payments always add up to the total', () => {
  for (const kind of Object.keys(PACKAGES) as Kind[]) {
    for (const plan of ['standard', 'full'] as const) {
      const q = quote(kind, { plan, qty: on('booking', 'reviews'), customAmount: 333, milestones: 3 });
      assert.equal(q.payments.reduce((s, p) => s + p.amount, 0), q.total, `${kind} ${plan}`);
    }
  }
});

test('a quote saved before tool/custom and extras still opens', () => {
  const old = { ...defaultInput('starter'), rush: 'urgent', qty: on('booking') } as Partial<QuoteInput>;
  delete old.build;
  delete old.extras;
  const back = decodeInput(encodeInput(old as QuoteInput));
  assert.ok(back);
  assert.deepEqual(back.build, {});
  assert.deepEqual(back.extras, []);
  assert.equal(back.rush, 'none');
  assert.equal(computeQuote(back).total, 2000);
});

test('the URL round-trips a full quote', () => {
  const input: QuoteInput = {
    ...defaultInput('webapp'),
    qty: on('booking'),
    build: { booking: 'custom' },
    extras: [{ label: 'Data import from spreadsheet', amount: 1500 }],
  };
  assert.deepEqual(decodeInput(encodeInput(input)), input);
});

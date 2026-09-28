import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/*
 * The handful of Stripe calls the studio needs, over plain fetch: customers,
 * invoices, and checking a webhook signature. Invoices are sent by email
 * from Stripe with a pay link; the studio never handles card details.
 */

const API = 'https://api.stripe.com/v1';

function key() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error('STRIPE_SECRET_KEY is not set.');
  return k;
}

export const stripeLive = () => (process.env.STRIPE_SECRET_KEY || '').includes('_live_');

export async function stripe<T = Record<string, unknown>>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: params ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${key()}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params ? new URLSearchParams(params) : undefined,
    cache: 'no-store',
  });
  const data = (await res.json()) as { error?: { message?: string } } & T;
  if (!res.ok) throw new Error(data.error?.message ?? `Stripe returned ${res.status}`);
  return data;
}

/** One customer per email, so every invoice lands on the same record. */
export async function findOrCreateCustomer(email: string, name?: string | null) {
  const found = await stripe<{ data: Array<{ id: string }> }>(
    `/customers?${new URLSearchParams({ email, limit: '1' })}`,
  );
  if (found.data[0]) return found.data[0].id;
  const created = await stripe<{ id: string }>('/customers', { email, ...(name ? { name } : {}) });
  return created.id;
}

export type InvoiceInput = {
  customer: string;
  /** Whole dollars. */
  amount: number;
  /** Line item text on the invoice. */
  line: string;
  /** Memo shown under the lines. */
  memo: string;
  dueDays: number;
  metadata?: Record<string, string>;
};

export type StripeInvoice = { id: string; livemode: boolean; hosted_invoice_url?: string | null; status?: string };

/** A draft with one line. Nothing is sent until finalizeAndSend. */
export async function createDraftInvoice(i: InvoiceInput): Promise<StripeInvoice> {
  const invoice = await stripe<StripeInvoice>('/invoices', {
    customer: i.customer,
    collection_method: 'send_invoice',
    days_until_due: String(i.dueDays),
    auto_advance: 'false',
    pending_invoice_items_behavior: 'exclude',
    currency: 'usd',
    description: i.memo,
    ...Object.fromEntries(Object.entries(i.metadata ?? {}).map(([k, v]) => [`metadata[${k}]`, v])),
  });
  await stripe('/invoiceitems', {
    customer: i.customer,
    invoice: invoice.id,
    currency: 'usd',
    amount: String(Math.round(i.amount * 100)),
    description: i.line,
  });
  return invoice;
}

/** The one product every retainer subscription bills against; created once, remembered. */
async function retainerProduct(): Promise<string> {
  const { getSetting, setSetting } = await import('@/lib/settings');
  const key = stripeLive() ? 'stripe_retainer_product_live' : 'stripe_retainer_product_test';
  const known = await getSetting(key);
  if (known) return known;
  const p = await stripe<{ id: string }>('/products', { name: 'Monthly retainer', description: 'Updates, monitoring and support after launch' });
  await setSetting(key, p.id);
  return p.id;
}

/**
 * A monthly subscription billed by emailed invoice (due in 7 days). A start
 * date in the future is a free period until then, so the first invoice goes
 * out on that date.
 */
export async function createRetainer(o: { customer: string; monthly: number; startAt: Date; label: string; metadata?: Record<string, string> }) {
  const product = await retainerProduct();
  const future = o.startAt.getTime() > Date.now() + 60_000;
  return stripe<{ id: string; status: string }>('/subscriptions', {
    customer: o.customer,
    collection_method: 'send_invoice',
    days_until_due: '7',
    description: o.label,
    'items[0][price_data][currency]': 'usd',
    'items[0][price_data][product]': product,
    'items[0][price_data][unit_amount]': String(Math.round(o.monthly * 100)),
    'items[0][price_data][recurring][interval]': 'month',
    ...(future ? { trial_end: String(Math.floor(o.startAt.getTime() / 1000)) } : {}),
    ...Object.fromEntries(Object.entries(o.metadata ?? {}).map(([k, v]) => [`metadata[${k}]`, v])),
  });
}

/** Stop at the end of the period already billed; nothing is refunded. */
export async function endRetainer(subId: string) {
  return stripe<{ id: string; current_period_end?: number; cancel_at?: number }>(`/subscriptions/${subId}`, { cancel_at_period_end: 'true' });
}

/** Finalize (assigns the number) and email it with the pay link. */
export async function finalizeAndSend(invoiceId: string): Promise<StripeInvoice> {
  await stripe(`/invoices/${invoiceId}/finalize`, {});
  return stripe<StripeInvoice>(`/invoices/${invoiceId}/send`, {});
}

export function dashboardUrl(inv: StripeInvoice) {
  return `https://dashboard.stripe.com/${inv.livemode ? '' : 'test/'}invoices/${inv.id}`;
}

/**
 * Stripe signs webhooks as `t=<ts>,v1=<hmac>` over `<ts>.<body>` with the
 * endpoint's secret. Reject anything older than five minutes.
 */
export function verifyWebhook(rawBody: string, header: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return expected.length === v1.length && timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

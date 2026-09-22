'use server';

import { cookies } from 'next/headers';
import { COOKIE, isValid } from './auth';
import { computeQuote, decodeInput, usd } from '@/lib/pricing';

/*
 * Drafts one payment of a quote as a Stripe invoice. The draft is never
 * finalised or sent from here: it opens in the dashboard, where it is read
 * over and sent by hand, so a slip in the estimator can't reach a client.
 *
 * Needs STRIPE_SECRET_KEY in the environment. A test key (sk_test_…) drafts
 * into test mode and the link opens the test dashboard.
 */

export type InvoiceResult = { url: string } | { error: string };

const API = 'https://api.stripe.com/v1';

export async function createInvoice(encoded: string, stageIndex: number): Promise<InvoiceResult> {
  // Server actions are callable by anyone who knows the route, so the gate
  // is checked here as well as on the page.
  const jar = await cookies();
  if (!isValid(jar.get(COOKIE)?.value)) return { error: 'Locked. Reload and enter the PIN.' };

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { error: 'STRIPE_SECRET_KEY is not set on the server.' };

  const input = decodeInput(encoded);
  if (!input) return { error: 'Could not read the quote.' };
  const quote = computeQuote(input);
  const stage = quote.payments[stageIndex];
  if (!stage) return { error: 'No such payment stage.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { error: 'Add the client email first; Stripe needs it for the invoice.' };
  }

  const stripe = async (path: string, params?: Record<string, string>) => {
    const res = await fetch(`${API}${path}`, {
      method: params ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: params ? new URLSearchParams(params) : undefined,
      cache: 'no-store',
    });
    const data = (await res.json()) as { error?: { message?: string } } & Record<string, unknown>;
    if (!res.ok) throw new Error(data.error?.message ?? `Stripe returned ${res.status}`);
    return data;
  };

  try {
    // One customer per email, so repeat invoices land on the same record.
    const found = (await stripe(
      `/customers?${new URLSearchParams({ email: input.email, limit: '1' })}`,
    )) as { data: Array<{ id: string }> };
    const customer =
      found.data[0]?.id ??
      ((await stripe('/customers', {
        email: input.email,
        ...(input.client ? { name: input.client } : {}),
      })) as { id: string }).id;

    const scope = quote.lines.map((l) => l.label).join(', ');
    const invoice = (await stripe('/invoices', {
      customer,
      collection_method: 'send_invoice',
      days_until_due: String(stage.dueDays),
      auto_advance: 'false',
      pending_invoice_items_behavior: 'exclude',
      currency: 'usd',
      description: `${stage.label}, ${stage.pct}% of ${usd.format(quote.total)}. ${stage.trigger}. Scope: ${scope}.`,
      'metadata[quote_total]': String(quote.total),
      'metadata[package]': quote.pkg.label,
      'metadata[stage]': `${stageIndex + 1} of ${quote.payments.length}: ${stage.label}`,
      ...(input.client ? { 'metadata[client]': input.client } : {}),
    })) as { id: string; livemode: boolean };

    await stripe('/invoiceitems', {
      customer,
      invoice: invoice.id,
      currency: 'usd',
      amount: String(stage.amount * 100),
      description: `${quote.pkg.label}${input.client ? ` for ${input.client}` : ''}: ${stage.label.toLowerCase()} (${stage.pct}%)`,
    });

    return {
      url: `https://dashboard.stripe.com/${invoice.livemode ? '' : 'test/'}invoices/${invoice.id}`,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Stripe request failed.' };
  }
}

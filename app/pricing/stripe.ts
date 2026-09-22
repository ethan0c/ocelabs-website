'use server';

import { getSession } from '@/lib/auth';
import { computeQuote, decodeInput, usd } from '@/lib/pricing';
import { createDraftInvoice, dashboardUrl, findOrCreateCustomer } from '@/lib/stripe';

/*
 * The estimator's ad-hoc "Draft in Stripe": one payment of a quote as a
 * draft invoice, opened in the dashboard. Leads that go through the studio
 * get their invoices sent automatically when the proposal is signed; this
 * stays for one-off work.
 */

export type InvoiceResult = { url: string } | { error: string };

export async function createInvoice(encoded: string, stageIndex: number): Promise<InvoiceResult> {
  if (!(await getSession())) return { error: 'Signed out. Reload and sign in.' };

  const input = decodeInput(encoded);
  if (!input) return { error: 'Could not read the quote.' };
  const quote = computeQuote(input);
  const stage = quote.payments[stageIndex];
  if (!stage) return { error: 'No such payment stage.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { error: 'Add the client email first; Stripe needs it for the invoice.' };
  }

  try {
    const customer = await findOrCreateCustomer(input.email, input.client || null);
    const invoice = await createDraftInvoice({
      customer,
      amount: stage.amount,
      line: `${quote.pkg.label}${input.client ? ` for ${input.client}` : ''}: ${stage.label.toLowerCase()} (${stage.pct}%)`,
      memo: `${stage.label}, ${stage.pct}% of ${usd.format(quote.total)}. ${stage.trigger}. Scope: ${quote.lines.map((l) => l.label).join(', ')}.`,
      dueDays: stage.dueDays,
      metadata: {
        quote_total: String(quote.total),
        package: quote.pkg.label,
        stage: `${stageIndex + 1} of ${quote.payments.length}: ${stage.label}`,
        ...(input.client ? { client: input.client } : {}),
      },
    });
    return { url: dashboardUrl(invoice) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Stripe request failed.' };
  }
}

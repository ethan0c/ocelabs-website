'use server';

import { getSession } from '@/lib/auth';
import { FULL_PAYMENT, computeQuote, decodeInput, usd } from '@/lib/pricing';
import { createDraftInvoice, dashboardUrl, findOrCreateCustomer } from '@/lib/stripe';

/*
 * The estimator's ad-hoc "Draft in Stripe": one payment of a quote as a
 * draft invoice, opened in the dashboard. Leads that go through the studio
 * get their invoices sent automatically when the proposal is signed; this
 * stays for one-off work.
 */

export type InvoiceResult = { url: string } | { error: string };

export async function createInvoice(encoded: string, stageIndex: number, leadId?: string | null): Promise<InvoiceResult> {
  if (!(await getSession())) return { error: 'Signed out. Reload and sign in.' };

  const input = decodeInput(encoded);
  if (!input) return { error: 'Could not read the quote.' };
  const quote = computeQuote(input);
  // -1 bills everything at once, whatever the schedule says.
  const stage = stageIndex < 0 ? { ...FULL_PAYMENT, amount: quote.total } : quote.payments[stageIndex];
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
        stage: stageIndex < 0 ? 'Full payment' : `${stageIndex + 1} of ${quote.payments.length}: ${stage.label}`,
        ...(input.client ? { client: input.client } : {}),
        // Lets the webhook record the payment on the lead when it's paid.
        ...(leadId ? { lead: leadId } : {}),
      },
    });
    return { url: dashboardUrl(invoice) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Stripe request failed.' };
  }
}

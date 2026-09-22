import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Estimator from '@/components/Estimator';
import PinForm from '@/components/PinForm';
import { COOKIE, isValid } from './auth';
import { lock } from './actions';
import { decodeInput } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Pricing — OCE Labs',
  robots: { index: false, follow: false },
};

// Reads a cookie, so this page is rendered per request rather than at build.
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function PricingPage({ searchParams }: Props) {
  const jar = await cookies();
  const open = isValid(jar.get(COOKIE)?.value);
  // A quote in the URL (from a bookmark, the tracker, or the proposal page's
  // "Edit" link) reopens the form exactly as it was.
  const initial = decodeInput((await searchParams).q);

  if (!open) {
    return (
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Internal</p>
        <h1 className="h1 rise rise-2">Pricing.</h1>
        <div className="rise rise-3">
          <PinForm />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="shell page-head est-head">
        <div>
          <p className="eyebrow rise rise-1">Internal</p>
          <h1 className="h1 rise rise-2">Estimate.</h1>
          <p className="lede rise rise-3">
            Work through the questionnaire answers top to bottom. The summary updates
            as you go, opens as a proposal to sign, and drafts each payment in Stripe.
          </p>
        </div>
        <form action={lock}>
          <button type="submit" className="ulink ulink--muted est-lock">
            Lock
          </button>
        </form>
      </header>

      <section className="shell">
        <Estimator initial={initial} />
      </section>
    </>
  );
}

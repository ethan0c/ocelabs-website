import type { Metadata } from 'next';
import Link from 'next/link';
import { PACKAGES, usd } from '@/lib/pricing';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — OCE Labs',
  description: 'Start a project with OCE Labs.',
};

export default function ContactPage() {
  return (
    <>
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">Tell us what you&apos;re building.</h1>
        <p className="lede rise rise-2">
          Our projects begin at $3k, and we
          reply within a day.
        </p>
        <p className="contact-starter rise rise-2">
          Small business on a tighter budget?{' '}
          <Link href="/starter" className="text-link">
            See Starter, from {usd.format(PACKAGES.starter.base)} &rarr;
          </Link>
        </p>
      </header>

      <section className="shell contact-wrap">
        <ContactForm />
      </section>
    </>
  );
}

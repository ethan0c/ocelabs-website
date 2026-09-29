import type { Metadata } from 'next';
import Link from 'next/link';
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
          A sentence or two is enough to start. Projects begin at $3k, and we
          reply within a day. Smaller business? See <Link href="/starter">Starter</Link>.
        </p>
      </header>

      <section className="shell contact-wrap">
        <ContactForm />
      </section>
    </>
  );
}

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
          A few lines about it is plenty to start with. We reply within a day.
        </p>
        <p className="contact-starter rise rise-2">
          Running a small local business?{' '}
          <Link href="/starter" className="text-link">
            Starter might be a better fit &rarr;
          </Link>
        </p>
      </header>

      <section className="shell contact-wrap">
        <ContactForm />
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';
import { PACKAGES, STARTER_WARRANTY_DAYS, WARRANTY_DAYS, usd, weeksLabel } from '@/lib/pricing';

/*
 * The small business tier, under the studio's name so it shares the
 * portfolio. The price is stated once, in the section that explains what it
 * covers, and comes from the price book so this page and a Starter quote
 * can't disagree. The low price is the smaller scope, not a discount.
 */
const pkg = PACKAGES.starter;

export const metadata: Metadata = {
  title: 'Starter — OCE Labs',
  description: `A proper website for a small local business, built on a layout we've already tested and published in ${weeksLabel(pkg.weeks)}.`,
};

const included = [
  {
    num: '01',
    name: `Up to ${pkg.pages} pages`,
    desc: 'Most businesses need a home page, a page for what they offer, and a way to get in touch. If you need another, we can add it.',
  },
  {
    num: '02',
    name: 'One of our layouts, in your colours',
    desc: 'Pick the one closest to your business. You send us the words and photos, and we set them in so it looks right.',
  },
  {
    num: '03',
    name: 'Your own domain and a contact form',
    desc: 'Messages land in your inbox, not in some dashboard you have to remember to check.',
  },
];

/* What the next package up adds, so the step to it reads as more work, not a markup. */
const adds = [
  'A design made from scratch',
  'We write the words',
  `Up to ${PACKAGES.website.pages} pages`,
  'Two rounds of changes',
  'Google setup and visitor stats',
  `${WARRANTY_DAYS} days of fixes`,
];

const BUDGETS = [
  `Starter, ${usd.format(pkg.base)}`,
  'Starter plus a few extras',
  'Not sure yet',
];

export default function StarterPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Starter, by OCE Labs</p>
        <h1 className="h1 rise rise-2">A proper website for your restaurant, shop or salon.</h1>
        <p className="lede rise rise-3">
          We start from a layout we&apos;ve already built and tested, fill it with your words and
          photos, and have it live in {weeksLabel(pkg.weeks)}. It&apos;s the same two people who
          do our bigger projects.
        </p>
        <div className="hero-links rise rise-3">
          <a href="#start" className="block block--primary">
            Get started <span className="arrow" aria-hidden="true">&rarr;</span>
          </a>
          <Link href="/work#templates" className="block">
            See the templates
          </Link>
        </div>
      </header>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">What you get</p>
          <h2 className="h2">{usd.format(pkg.base)}, and here&apos;s what that covers.</h2>
          <p className="sec-lede">
            Half when you sign, half when it&apos;s ready to go live. You get one round of changes
            before launch, and if anything breaks in the first {STARTER_WARRANTY_DAYS} days, we fix it.
          </p>
        </Reveal>
        <Reveal stagger>
          {included.map(({ num, name, desc }) => (
            <div key={num} className="cap-row">
              <span className="cap-num">{num}</span>
              <div>
                <h3 className="cap-name">{name}</h3>
                <p className="cap-desc">{desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal>
          <p className="cap-note">
            Once it&apos;s live, we can set you up to change your own hours, prices and photos, or
            you can send changes to us and we&apos;ll make them. We&apos;ll talk through both.
          </p>
        </Reveal>
      </section>

      <section className="shell capabilities">
        <Reveal className="makes">
          <div className="sec-head sec-head--tight">
            <p className="eyebrow">If a layout isn&apos;t enough</p>
            <h2 className="h2">The Website Package adds</h2>
          </div>
          <ul className="makes-list">
            {adds.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <p className="cap-note">
            Need more than that, like animation, an online store or customer logins?{' '}
            <Link href="/contact" className="text-link">
              Tell us what you have in mind
            </Link>.
          </p>
        </Reveal>
      </section>

      <section id="start" className="shell page-head">
        <h2 className="h2">Tell us about your business.</h2>
        <p className="lede">
          What you do, where you are, and whether you already have a site. One of us will write
          back within a day.
        </p>
      </section>
      <section className="shell contact-wrap">
        <ContactForm budgets={BUDGETS} />
      </section>
    </>
  );
}

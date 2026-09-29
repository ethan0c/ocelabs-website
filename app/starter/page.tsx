import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';
import { ADDONS, PACKAGES, RETAINERS, STARTER_WARRANTY_DAYS, WARRANTY_DAYS, usd, weeksLabel } from '@/lib/pricing';

/*
 * The small business tier, under the studio's name so it shares the
 * portfolio. Prices come from the price book, so this page and a Starter
 * quote can't disagree. The low price is the smaller scope, not a discount:
 * our layouts, the client's own words, one round of changes, no search work.
 */
const pkg = PACKAGES.starter;
const care = RETAINERS.find((r) => r.id === 'care')!.monthly;
const selfEdit = ADDONS.find((a) => a.id === 'selfedit')!.price;

export const metadata: Metadata = {
  title: 'Starter — OCE Labs',
  description: `A proper website for a small business. Up to ${pkg.pages} pages, live in ${weeksLabel(pkg.weeks)}, ${usd.format(pkg.base)}.`,
};

const included = [
  {
    num: '01',
    name: `Up to ${pkg.pages} pages`,
    desc: `Home, Services and Contact, for example. More at ${usd.format(pkg.extraPage)} each.`,
  },
  {
    num: '02',
    name: 'One of our layouts, in your colours',
    desc: 'You send the words and photos, and we put them in.',
  },
  {
    num: '03',
    name: 'On your domain, with a contact form',
    desc: 'Messages go straight to your inbox.',
  },
];

/* What the next package up adds, so the step to it reads as more work, not a markup. */
const adds = [
  'Custom design from scratch',
  'Copy written for you',
  `Up to ${PACKAGES.website.pages} pages`,
  'Two rounds of changes',
  'Search setup and analytics',
  `${WARRANTY_DAYS} days of fixes`,
];

const BUDGETS = [
  `Starter, ${usd.format(pkg.base)}`,
  'Starter with extras',
  'Not sure yet',
];

export default function StarterPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Starter by OCE Labs</p>
        <h1 className="h1 rise rise-2">A proper website for a small business.</h1>
        <p className="lede rise rise-3">
          Up to {pkg.pages} pages, live in {weeksLabel(pkg.weeks)}, {usd.format(pkg.base)}. Made by
          the same studio as our custom work, on layouts we have already proven.
        </p>
        <div className="hero-links rise rise-3">
          <a href="#start" className="block block--primary">
            Get started <span className="arrow" aria-hidden="true">&rarr;</span>
          </a>
          <Link href="/work" className="block">
            See the work
          </Link>
        </div>
      </header>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">What {usd.format(pkg.base)} includes</p>
          <h2 className="h2">A clean, simple site that&apos;s yours.</h2>
          <p className="sec-lede">
            One round of changes before launch, and {STARTER_WARRANTY_DAYS} days of fixes after.
            Half on signature, half before launch.
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
            After launch, edit your hours, prices and photos yourself for a one-time{' '}
            {usd.format(selfEdit)}, or send changes to us for {usd.format(care)} a month.
          </p>
        </Reveal>
      </section>

      <section className="shell capabilities">
        <Reveal className="makes">
          <div className="sec-head sec-head--tight">
            <p className="eyebrow">Website Package, from {usd.format(PACKAGES.website.base)}</p>
            <h2 className="h2">Need more? The Website Package adds</h2>
          </div>
          <ul className="makes-list">
            {adds.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <p className="cap-note">
            Bigger than that, with motion, a store or accounts?{' '}
            <Link href="/contact" className="text-link">
              Tell us about the project
            </Link>.
          </p>
        </Reveal>
      </section>

      <section id="start" className="shell page-head">
        <h2 className="h2">Tell us about your business.</h2>
        <p className="lede">
          What you do, where you are, and whether you have a site now. We reply within a day.
        </p>
      </section>
      <section className="shell contact-wrap">
        <ContactForm budgets={BUDGETS} />
      </section>
    </>
  );
}

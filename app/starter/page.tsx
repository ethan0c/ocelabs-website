import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';
import { ADDONS, PACKAGES, RETAINERS, WARRANTY_DAYS, usd, weeksLabel } from '@/lib/pricing';

/*
 * The small business tier, under the studio's name so it shares the
 * portfolio. Prices come from the price book, so this page and a Starter
 * quote can't disagree. The low price is the smaller scope, not a discount:
 * our layouts rather than a custom design, three pages, one review round.
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
    name: 'Our layouts, your business',
    desc: 'Built on layouts we have already proven, set in your colours, type, photos and words.',
  },
  {
    num: '03',
    name: 'Domain and hosting',
    desc: 'Registered in your name, connected, HTTPS. Nothing parked on ours.',
  },
  {
    num: '04',
    name: 'Contact form',
    desc: 'Messages go straight to your inbox. Booking and newsletter signup can be added.',
  },
  {
    num: '05',
    name: 'Search setup',
    desc: 'Titles, descriptions, sitemap and Google Search Console, so people can find you.',
  },
  {
    num: '06',
    name: 'One review round',
    desc: 'You see it on a staging link, send one list of changes, and we launch.',
  },
  {
    num: '07',
    name: `${WARRANTY_DAYS} days of fixes`,
    desc: `Anything we missed after launch, at no charge. After that, ${usd.format(care)} a month covers small edits.`,
  },
];

const custom = [
  'A design made from scratch',
  'More than five pages',
  'Motion, video, or art direction',
  'Accounts, a store, or a dashboard',
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
          Up to {pkg.pages} pages, live in {weeksLabel(pkg.weeks)}, {usd.format(pkg.base)}. The
          same studio, hosting and search setup as our custom work, built on layouts we have
          already proven instead of designed from scratch.
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
          <h2 className="h2">Everything it takes to be open online.</h2>
          <p className="sec-lede">
            Half on signature, half before launch. After launch, change your hours, prices and
            photos yourself for a one-time {usd.format(selfEdit)}, or send them to us for{' '}
            {usd.format(care)} a month and we make them within two business days.
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
      </section>

      <section className="shell capabilities">
        <Reveal className="makes">
          <div className="sec-head sec-head--tight">
            <p className="eyebrow">When to go custom</p>
            <h2 className="h2">Starter is not the right fit if you need</h2>
          </div>
          <ul className="makes-list">
            {custom.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <p className="cap-note">
            Those are our custom packages, from {usd.format(PACKAGES.website.base)}.{' '}
            <Link href="/contact">Tell us about the project</Link> instead.
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

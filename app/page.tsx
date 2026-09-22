import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';

/*
 * The page is structured as the offer: one studio does the whole chain, in
 * order, and keeps it running. Each step is a real deliverable, not a value.
 */
const steps = [
  {
    num: '01',
    name: 'Domain and hosting',
    desc: 'Registered in your name, connected, HTTPS, redirects. Nothing parked on ours.',
  },
  {
    num: '02',
    name: 'Design',
    desc: 'Identity, interface, and art direction. Two review rounds, one approver.',
  },
  {
    num: '03',
    name: 'Build',
    desc: 'Websites, web apps, iOS and Android from one codebase.',
  },
  {
    num: '04',
    name: 'Setup',
    desc: 'Contact forms, booking, analytics, business email, and whatever else the site needs to work on day one.',
  },
  {
    num: '05',
    name: 'Search',
    desc: 'Search-ready build, sitemap and Search Console submitted, local SEO and content plan when it fits.',
  },
  {
    num: '06',
    name: 'Launch',
    desc: 'A date in writing at kickoff. Staging review, then live on your domain, usually the same day.',
  },
  {
    num: '07',
    name: 'Upkeep',
    desc: 'Thirty days of fixes included. After that, a monthly retainer for updates, monitoring, and a search review each quarter.',
  },
];

const makes = ['Websites', 'Web apps', 'Mobile apps', 'Brand systems'];

export default function HomePage() {
  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <h1 className="h1 hero-title rise rise-1">
            The whole thing, not just the website.
          </h1>
          <p className="lede rise rise-2">
            Domain, design, build, hosting, forms, search, and the upkeep after. One
            two-person studio, one fixed price from $3k, and a launch date in writing.
          </p>
          <div className="hero-links rise rise-3">
            <Link href="/contact" className="block block--primary">
              Start a project <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/work" className="block">
              See the work
            </Link>
          </div>
          <p className="hero-proof rise rise-3">
            Recent work for Ada Palm, Helthy, and Concepta. Most sites launch in four to six
            weeks.
          </p>
        </div>

        {/* One real project above the fold, so the hero shows rather than tells.
            Hover plays the clip; touch gets the still. */}
        <Link href="/work" className="hero-preview rise rise-3" aria-label="See the work">
          <WorkPreview
            name="Ada Palm"
            shot="adapalm.png"
            clip="adapalm.mp4"
            priority
            sizes="(max-width: 56rem) 100vw, 48vw"
          />
          <span className="hero-preview-cap">
            <span>Ada Palm</span>
            <span>Marketing consultancy, New York</span>
          </span>
        </Link>
      </section>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">What every project includes</p>
          <h2 className="h2">From the domain to the search results.</h2>
          <p className="sec-lede">
            Most studios hand you a design and a folder of files. We hand you a running
            site: registered, hosted, wired up, indexed, and looked after.
          </p>
        </Reveal>
        <Reveal stagger>
          {steps.map(({ num, name, desc }) => (
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
            <p className="eyebrow">What we make</p>
            <h2 className="h2">Four things, done properly.</h2>
          </div>
          <ul className="makes-list">
            {makes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <p className="cap-note">
            We work in what&apos;s left after the excess is gone. Every element earns its
            place or it goes &mdash; clarity is what you refuse to add.
          </p>
        </Reveal>
      </section>
    </>
  );
}

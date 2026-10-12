import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';
import { clipFor, projects } from '@/lib/projects';

/*
 * The page is structured as the offer: one studio does the whole chain, in
 * order, and keeps it running. Each step is a real deliverable, not a value.
 * One line each — the number and the name carry it; the line keeps the one
 * specific worth knowing.
 */
const steps = [
  {
    num: '01',
    name: 'Domain and hosting',
    desc: 'Registered in your name, so you own it outright.',
  },
  {
    num: '02',
    name: 'Design',
    desc: 'How it looks and feels. Two rounds of feedback.',
  },
  {
    num: '03',
    name: 'Build',
    desc: 'Websites, web apps, and apps for iPhone and Android.',
  },
  {
    num: '04',
    name: 'Setup',
    desc: 'Forms, booking, business email and visitor stats, working on day one.',
  },
  {
    num: '05',
    name: 'Search',
    desc: 'Built for Google and submitted the day it launches.',
  },
  {
    num: '06',
    name: 'Launch',
    desc: 'A date in writing at the start. Live, usually the same day you approve it.',
  },
  {
    num: '07',
    name: 'Upkeep',
    desc: 'Thirty days of fixes, then a monthly plan if you want one.',
  },
];

const makes = ['Websites', 'Web apps', 'Mobile apps', 'Brand systems'];

// The first project is the hero shot; the next three make the strip below.
const [hero, ...rest] = projects;
const strip = rest.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <h1 className="h1 hero-title rise rise-1">
            The whole thing, not just the website.
          </h1>
          <p className="lede rise rise-2">
            We register the domain, design and build the site, set up the forms and email, get it
            on Google, and look after it once it&apos;s live. You deal with the same two people the
            whole way through.
          </p>
          <div className="hero-links rise rise-3">
            <Link href="/contact" className="block block--primary">
              Start a project <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/work" className="block">
              See the work
            </Link>
          </div>
          <p className="hero-proof rise rise-3">Most sites launch in four to six weeks.</p>
        </div>

        {/* One real project above the fold, so the hero shows rather than tells.
            Hover plays the clip; touch gets the still. */}
        <Link href="/work" className="work-tile rise rise-3" aria-label="See the work">
          <WorkPreview
            name={hero.name}
            shot={hero.shot}
            clip={clipFor(hero.shot)}
            priority
            sizes="(max-width: 56rem) 100vw, 48vw"
          />
          <span className="work-tile-cap">
            <span>{hero.name}</span>
            <span>{hero.client}</span>
          </span>
        </Link>
      </section>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">What every project includes</p>
          <h2 className="h2">From the domain to the search results.</h2>
          <p className="sec-lede">
            A lot of studios hand over a design and a folder of files and call it done. We hand
            over a site that&apos;s live, working, and looked after.
          </p>
        </Reveal>
        <Reveal stagger className="steps-grid">
          {steps.map(({ num, name, desc }) => (
            <div key={num} className="step">
              <span className="step-num">{num}</span>
              <h3 className="cap-name">{name}</h3>
              <p className="cap-desc">{desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Three more shots after the offer, so the claim is followed by proof.
          Each links to Work, where the details and the live sites are. */}
      <section className="shell home-work">
        <Reveal className="sec-head sec-head--row">
          <div>
            <p className="eyebrow">Recent work</p>
            <h2 className="h2">A few things we&apos;ve made.</h2>
          </div>
          <Link href="/work" className="ulink ulink--muted">
            See all the work
          </Link>
        </Reveal>
        <Reveal stagger className="home-work-grid">
          {strip.map((p) => (
            <Link key={p.name} href="/work" className="work-tile">
              <WorkPreview
                name={p.name}
                shot={p.shot}
                clip={clipFor(p.shot)}
                // Three-up from 52rem, full width below — matches .home-work-grid.
                sizes="(max-width: 52rem) 100vw, 33vw"
              />
              <span className="work-tile-cap">
                <span>{p.name}</span>
                <span>{p.client}</span>
              </span>
            </Link>
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
            We keep things simple, on the page and in how we work. Running a business is hard
            enough, so we look after everything technical, before launch and long after it, and
            you get on with running yours.
          </p>
        </Reveal>
      </section>
    </>
  );
}

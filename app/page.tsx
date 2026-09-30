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
    desc: 'Registered in your name and set up properly, so you own it outright. Nothing sits on our accounts.',
  },
  {
    num: '02',
    name: 'Design',
    desc: 'How it looks, how it feels to use, and how it fits your brand. Two rounds of feedback, and one person on your side signs off.',
  },
  {
    num: '03',
    name: 'Build',
    desc: 'Websites, web apps, and apps for iPhone and Android.',
  },
  {
    num: '04',
    name: 'Setup',
    desc: 'Contact forms, booking, visitor stats, business email, and whatever else it needs to work on the first day.',
  },
  {
    num: '05',
    name: 'Search',
    desc: 'Built so Google can find it and make sense of it, and submitted the day it launches. Local search and a content plan if you need them.',
  },
  {
    num: '06',
    name: 'Launch',
    desc: 'You get a launch date in writing at the start. We show you the finished site privately first, then put it live, usually the same day.',
  },
  {
    num: '07',
    name: 'Upkeep',
    desc: 'If anything breaks in the first thirty days, we fix it. After that, a monthly plan covers updates, keeping an eye on things, and a look at your search results every few months.',
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
            A lot of studios hand over a design and a folder of files and call it done. We hand
            over a site that&apos;s live, working, and looked after.
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
            We keep things simple on purpose. If something on the page isn&apos;t helping the
            person reading it, we take it out.
          </p>
        </Reveal>
      </section>
    </>
  );
}

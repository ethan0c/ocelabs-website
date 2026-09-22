import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';

const capabilities = [
  {
    num: '01',
    name: 'Web',
    desc: 'Marketing sites, web apps, and platforms.',
  },
  {
    num: '02',
    name: 'Mobile',
    desc: 'iOS and Android, built cross-platform.',
  },
  {
    num: '03',
    name: 'Design',
    desc: 'Identity, interface systems, and art direction.',
  },
  {
    num: '04',
    name: 'SEO',
    desc: 'Search-ready builds, for one site or a whole portfolio of them.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <h1 className="h1 hero-title rise rise-1">Websites and apps that ship complete.</h1>
          <p className="lede rise rise-2">
            A two-person studio. Fixed prices from $3k, a launch date in writing, and
            everything set up &mdash; hosting, forms, analytics, search &mdash; live on your
            domain.
          </p>
          <div className="hero-links rise rise-3">
            <Link href="/contact" className="pill pill--primary">
              Start a project <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/work" className="pill">
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

      <section className="shell capabilities">
        <h2 className="sr-only">What we do</h2>
        <Reveal stagger>
          {capabilities.map(({ num, name, desc }) => (
            <div key={num} className="cap-row">
              <span className="cap-num">{num}</span>
              <div>
                <p className="cap-name">{name}</p>
                <p className="cap-desc">{desc}</p>
              </div>
            </div>
          ))}
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

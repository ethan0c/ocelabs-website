import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';
import { clipFor } from '@/lib/projects';

/*
 * A page of its own because it has three answers instead of one: Rodney is
 * choosing between three full builds, and a Work card can only hold one
 * picture. Everything here is in /public/work/closet-six.
 */

export const metadata: Metadata = {
  title: 'Closet Six — OCE Labs',
  description: "Three directions for a stylist's portfolio, and the type and marks behind them.",
};

/** Still the staging address until the domain moves; each direction has its own path. */
const STAGING = 'https://closetsix.vercel.app';

const facts = [
  ['Client', 'Closet Six. Styling and creative direction for athletes.'],
  ['What we did', 'Design, build, type and marks, domain and hosting.'],
  ['Pages', 'Home, Work sorted by gameday, editorial, runway and event, About, and a page per shoot.'],
  ['Where it is', 'Built and in review. Rodney is choosing a direction.'],
];

const directions = [
  {
    num: '01',
    name: 'White',
    shot: 'closet-six/site-1.png',
    href: `${STAGING}/`,
    desc: 'A white page and four photo panels edge to edge, one per kind of work. Hover a panel and it widens while the others take on the warm, faded look of his Instagram. The type stays small and the photos do the talking.',
  },
  {
    num: '02',
    name: 'Grid',
    shot: 'closet-six/site-2.png',
    href: `${STAGING}/2`,
    desc: 'Six photos, three by two, with the name across the bottom of them. Dark, so the photos glow. A six-square mark in the corner, the last square in the house yellow.',
  },
  {
    num: '03',
    name: 'Slab',
    shot: 'closet-six/site-3.png',
    href: `${STAGING}/3`,
    desc: 'The athletic one. Big slab capitals, a red six raised like a jersey number, and one photo filling the screen behind them. The quietest navigation and the loudest type.',
  },
];

const wordmarks = [
  { file: 'wordmark-1.png', w: 400, h: 100, name: 'Site one', note: 'One grotesk, set heavy.' },
  { file: 'wordmark-2.png', w: 400, h: 100, name: 'Site two', note: 'The same, with the six-square mark.' },
  { file: 'wordmark-3.png', w: 600, h: 150, name: 'Site three', note: 'Slab capitals, the six raised in red.' },
];

const marks = [
  { file: 'mark-cs.png', w: 785, h: 733, name: 'His monogram', note: 'The CS he already had, cleaned up.' },
  { file: 'mark-grid.svg', w: 32, h: 32, name: 'Six squares', note: 'Three by two, like the home page of site two.' },
  { file: 'mark-c6.svg', w: 64, h: 64, name: 'C6', note: 'The small version, on the browser tab of site one.' },
];

const role = [
  {
    num: '01',
    name: 'Design',
    desc: 'Three directions, each built out as a whole site rather than a picture of one, so he chooses from the real thing.',
  },
  {
    num: '02',
    name: 'Build',
    desc: 'A plain static site with nothing running behind it. Fast, and it can be hosted anywhere.',
  },
  {
    num: '03',
    name: 'Type and marks',
    desc: 'A wordmark for each direction, two marks drawn from scratch, and a clean-up of the monogram he already had.',
  },
  {
    num: '04',
    name: 'Domain and hosting',
    desc: 'In his name, connected the day he picks a direction.',
  },
  {
    num: '05',
    name: 'After launch',
    desc: 'New photos go up with a short routine we have written down for him. We look after the rest.',
  },
];

export default function ClosetSixPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Closet Six</p>
        <h1 className="h1 rise rise-2">Three ways to let the photos talk.</h1>
        <p className="lede rise rise-3">
          Rodney styles athletes and directs their shoots. His site didn&apos;t look like his
          Instagram, so we built three that do, all photo first, and let him choose.
        </p>
        <dl className="cs-meta rise rise-3">
          {facts.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="shell cs-dirs">
        {directions.map(({ num, name, shot, href, desc }, i) => (
          <Reveal key={num} className="cs-dir">
            <WorkPreview
              name={`Closet Six, site ${name.toLowerCase()}`}
              shot={shot}
              clip={clipFor(shot)}
              sizes="100vw"
              // The first shot is above the fold on most screens.
              priority={i === 0}
            />
            <div className="cs-dir-text">
              <div>
                <div className="cs-dir-head">
                  <span className="work-num">{num}</span>
                  <h2 className="cs-dir-name">{name}</h2>
                </div>
                <a
                  className="ulink ulink--muted cs-dir-open"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open this one
                </a>
              </div>
              <p className="cs-dir-desc">{desc}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="shell cs-marks">
        <Reveal className="sec-head">
          <p className="eyebrow">Marks and type</p>
          <h2 className="h2">A wordmark for each, and a mark still open.</h2>
          <p className="sec-lede">
            Sites one and two set everything in one typeface, two weights and four sizes, so the
            type never competes with a photo. Site three switches to slab capitals and a jersey
            number. The mark is Rodney&apos;s call: we started from his monogram and drew two more.
          </p>
        </Reveal>
        <Reveal stagger className="cs-row">
          {wordmarks.map(({ file, w, h, name, note }) => (
            <figure key={file}>
              <div className="cs-tile">
                <Image
                  src={`/work/closet-six/${file}`}
                  alt={`${name} wordmark`}
                  width={w}
                  height={h}
                  sizes="(max-width: 56rem) 50vw, 33vw"
                />
              </div>
              <figcaption className="cs-cap">
                <span>{name}</span>
                <span>{note}</span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
        <Reveal stagger className="cs-row">
          {marks.map(({ file, w, h, name, note }) => (
            <figure key={file}>
              <div className="cs-tile cs-tile--mark">
                <Image
                  src={`/work/closet-six/${file}`}
                  alt={`${name} mark`}
                  width={w}
                  height={h}
                  // Two of these are SVGs; they ship as drawn.
                  unoptimized
                />
              </div>
              <figcaption className="cs-cap">
                <span>{name}</span>
                <span>{note}</span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </section>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">Our part</p>
          <h2 className="h2">What we did, and what he does.</h2>
        </Reveal>
        <Reveal stagger>
          {role.map(({ num, name, desc }) => (
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

      <section className="shell cs-end">
        <Reveal className="hero-links">
          <Link href="/contact" className="block block--primary">
            Start a project <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/work" className="block">
            All the work
          </Link>
        </Reveal>
      </section>
    </>
  );
}

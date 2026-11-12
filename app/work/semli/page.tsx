import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';
import { clipFor } from '@/lib/projects';

/*
 * Semli gets a page of its own because it is more than one thing: an iPhone
 * app, the site that introduces it, and the brand both share. A Work card can
 * only show one of them. Everything here is in /public/work/semli.
 */

export const metadata: Metadata = {
  title: 'Semli — OCE Labs',
  description: 'A daily planner for college students: the iPhone app, the website, the brand and the logo.',
};

const SITE = 'https://semli.app';

const facts = [
  ['Product', 'Semli. A daily planner for college students, especially the ones who also work.'],
  ['What we did', 'Brand and logo, app design and build, the website, and the App Store artwork.'],
  ['Platforms', 'iPhone, and a website with pricing and a beta sign-up.'],
  ['Where it is', 'The site is live. The iPhone beta opens soon.'],
];

const screens = [
  { file: 'app-today.png', name: 'Today', note: "What's next, and how long until it ends." },
  { file: 'app-review.png', name: 'Review', note: 'A syllabus read into dates, checked before saving.' },
  { file: 'app-plan.png', name: 'Plan', note: 'The week, with work hours and clashes marked.' },
  { file: 'app-school.png', name: 'School', note: "Every course and what's due in the next four weeks." },
];

const marks = [
  { file: 'wordmark.svg', w: 3620, h: 1132, name: 'Wordmark', note: 'The two dots become the i and the full stop.', wide: true },
  { file: 'mark.svg', w: 610, h: 618, name: 'Mark', note: 'A big dot for today, a small one for next.' },
  { file: 'icon.png', w: 512, h: 512, name: 'App icon', note: 'The mark in white and lavender on near black.', icon: true },
];

const store = [
  { file: 'store-today.png', name: 'Know what matters today' },
  { file: 'store-review.png', name: 'A semester in two minutes' },
  { file: 'store-spread.png', name: 'A heavy week, spread out' },
];

const role = [
  {
    num: '01',
    name: 'Brand and logo',
    desc: 'The two-dot mark, the wordmark, the app icon, and the colours and type the app and the site share.',
  },
  {
    num: '02',
    name: 'App design',
    desc: 'Every screen, from the first run to the paid plan. Plain rows, one big number per screen, and colour only when it means something.',
  },
  {
    num: '03',
    name: 'App build',
    desc: 'An iPhone app that keeps the plan on the phone, reads syllabi, shift schedules and screenshots into dates, and backs up to an account.',
  },
  {
    num: '04',
    name: 'Website',
    desc: 'Home, pricing and a beta sign-up, in the same colours and type as the app.',
  },
  {
    num: '05',
    name: 'Launch',
    desc: 'The App Store screenshots and artwork, and the run-up to the iPhone beta.',
  },
];

export default function SemliPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Semli</p>
        <h1 className="h1 rise rise-2">One plan for classes, shifts and deadlines.</h1>
        <p className="lede rise rise-3">
          Students juggle a syllabus per class, a work schedule and a group chat. Semli turns all
          of it into one plan. We made the brand, the logo, the iPhone app and the site.
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
        <Reveal className="cs-dir">
          <WorkPreview
            name="Semli website"
            shot="semli/site.png"
            clip={clipFor('semli/site.png')}
            sizes="100vw"
            priority
          />
          <div className="cs-dir-text">
            <div>
              <div className="cs-dir-head">
                <span className="work-num">01</span>
                <h2 className="cs-dir-name">The website</h2>
              </div>
              <a
                className="ulink ulink--muted cs-dir-open"
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the site
              </a>
            </div>
            <p className="cs-dir-desc">
              A sky photo, one serif headline and one lavender word. It says what the app does in a
              sentence, shows it on a phone, and signs students up for the beta. Pricing has a page
              of its own.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="shell cs-marks">
        <Reveal className="sec-head">
          <p className="eyebrow">The app</p>
          <h2 className="h2">Plain rows and one big number.</h2>
          <p className="sec-lede">
            Each screen leads with the one thing that matters now, like the minutes until a lecture
            ends or the dates found in a syllabus. Colour only means something: red is due or
            clashing, green is done. Nothing an import finds is saved until the student checks it.
          </p>
        </Reveal>
        <Reveal stagger className="cs-row cs-row--phones">
          {screens.map(({ file, name, note }) => (
            <figure key={file}>
              <div className="cs-tile">
                <Image
                  src={`/work/semli/${file}`}
                  alt={`Semli ${name} screen`}
                  width={920}
                  height={2000}
                  sizes="(max-width: 56rem) 50vw, 25vw"
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

      <section className="shell cs-marks">
        <Reveal className="sec-head">
          <p className="eyebrow">Brand and logo</p>
          <h2 className="h2">Two dots: today, and what comes next.</h2>
          <p className="sec-lede">
            The mark is a big dot for today and a small lavender one for what&apos;s next. In the
            wordmark they become the dot on the i and the full stop. One typeface runs the app, and
            a serif is kept for the few lines that speak to students, like the store captions.
          </p>
        </Reveal>
        <Reveal stagger className="cs-row">
          {marks.map(({ file, w, h, name, note, wide, icon }) => (
            <figure key={file}>
              <div className={`cs-tile cs-tile--mark${wide ? ' cs-tile--wordmark' : ''}`}>
                <Image
                  src={`/work/semli/${file}`}
                  alt={`Semli ${name.toLowerCase()}`}
                  width={w}
                  height={h}
                  className={icon ? 'cs-icon' : undefined}
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
        <Reveal stagger className="cs-row">
          {store.map(({ file, name }) => (
            <figure key={file}>
              <div className="cs-tile">
                <Image
                  src={`/work/semli/${file}`}
                  alt={`Semli App Store screenshot: ${name}`}
                  width={920}
                  height={2000}
                  sizes="(max-width: 56rem) 50vw, 33vw"
                />
              </div>
              <figcaption className="cs-cap">
                <span>{name}</span>
                <span>App Store</span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </section>

      <section className="shell steps">
        <Reveal className="sec-head">
          <p className="eyebrow">Our part</p>
          <h2 className="h2">All of it, from the icon to the code.</h2>
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

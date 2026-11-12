import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';
import { clipFor } from '@/lib/projects';

/*
 * Semli's app, site, and identity use assets from the Semli project. The
 * website image reflects the public site; phone and store images come from
 * Semli's current screenshot set in /design/screenshots.
 */

export const metadata: Metadata = {
  title: 'Semli — OCE Labs',
  description: 'Semli brings classes, shifts and deadlines into one iPhone planner. OCE Labs built the app, identity and website.',
};

const SITE = 'https://semli.app';

const facts = [
  ['Product', 'An iPhone planner for students balancing classes, work and due dates.'],
  ['What we did', 'Identity, iPhone app design and build, website and App Store artwork.'],
  ['Platforms', 'iPhone app and a website with pricing and a schedule import preview.'],
  ['Where it is', 'The iPhone app is on the App Store, and the website is live.'],
];

const screens = [
  { file: 'app-today.png', name: 'Today', note: 'Classes, shifts and due dates on one list.' },
  { file: 'app-review.png', name: 'Review', note: 'Dates from a syllabus, ready to check before adding.' },
  { file: 'app-plan.png', name: 'Plan', note: 'The week by hour, with the next few days below.' },
  { file: 'app-school.png', name: 'School', note: 'Courses and due dates across the next four weeks.' },
];

const marks = [
  { file: 'wordmark.svg', w: 3620, h: 1132, name: 'Wordmark', note: 'The two dots become the i and the full stop.', wide: true },
  { file: 'mark.svg', w: 610, h: 618, name: 'Mark', note: 'A big dot for today, a small one for next.' },
  { file: 'icon.png', w: 512, h: 512, name: 'App icon', note: 'The mark in white and lavender on near black.', icon: true },
];

const store = [
  { file: 'store-today.png', name: 'Classes, shifts, and deadlines' },
  { file: 'store-review.png', name: 'Your syllabus, in your planner' },
  { file: 'store-spread.png', name: 'Plan ahead for busy weeks' },
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
    desc: 'Today, calendar, school and import review screens built around what needs attention now.',
  },
  {
    num: '03',
    name: 'App build',
    desc: 'An iPhone planner that reads syllabi, schedules and screenshots into dates, lets students check them, and backs up signed-in plans.',
  },
  {
    num: '04',
    name: 'Website',
    desc: 'A home page, pricing and an import preview, with a path to the public iPhone app.',
  },
  {
    num: '05',
    name: 'App Store launch',
    desc: 'The App Store screenshots, icon artwork and website links for the public release.',
  },
];

export default function SemliPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Semli</p>
        <h1 className="h1 rise rise-2">One plan for classes, shifts and deadlines.</h1>
        <p className="lede rise rise-3">
          Semli gives students one place to see their week and check dates pulled from syllabi and
          schedules. We designed and built the iPhone app, its identity and the website.
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
              A sky backdrop, a clear headline and a phone showing the Today view. The site explains
              the app and sends iPhone visitors to the App Store. Pricing and an import preview have
              pages of their own.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="shell cs-marks">
        <Reveal className="sec-head">
          <p className="eyebrow">The app</p>
          <h2 className="h2">A plan students can check at a glance.</h2>
          <p className="sec-lede">
            Today shows what is next. Plan puts classes and shifts on a weekly calendar. School keeps
            course deadlines in view, and the import review shows the dates found in a syllabus before
            a student adds them.
          </p>
        </Reveal>
        <Reveal stagger className="cs-row cs-row--phones">
          {screens.map(({ file, name, note }) => (
            <figure key={file}>
              <div className="cs-tile">
                <Image
                  src={`/work/semli/${file}`}
                  alt={`Semli ${name} screen`}
                  width={1320}
                  height={2868}
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
            A large dot and a smaller lavender one make the app mark. In the wordmark they become the
            dot on the i and the full stop. The same colours and type carry through the app, website
            and App Store images.
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
      </section>

      <section className="shell cs-marks">
        <Reveal className="sec-head">
          <p className="eyebrow">App Store</p>
          <h2 className="h2">Screens that show the product.</h2>
          <p className="sec-lede">The store images pair current app screens with short lines about the day, syllabus imports and busy weeks.</p>
        </Reveal>
        <Reveal stagger className="cs-row">
          {store.map(({ file, name }) => (
            <figure key={file}>
              <div className="cs-tile">
                <Image
                  src={`/work/semli/${file}`}
                  alt={`Semli App Store screenshot: ${name}`}
                  width={1320}
                  height={2868}
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
          <h2 className="h2">Brand, app, website and launch.</h2>
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

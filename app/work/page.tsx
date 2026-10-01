import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';

export const metadata: Metadata = {
  title: 'Work — OCE Labs',
  description: 'Websites and apps we have designed and built.',
};

type Project = {
  name: string;
  desc: string;
  /** What we made, when it's more than a site. Tells a web app from a brochure at a glance. */
  kind?: string;
  href: string;
  /** File in /public/work. Rendered only if it actually exists. */
  shot: string;
};

const projects: Project[] = [
  {
    name: 'Ada Palm',
    desc: 'A site for a New York marketing consultancy, with their showreel filling the screen. We moved them off a monthly website builder onto a site they own.',
    kind: 'Brand website',
    href: 'https://adapalm.com',
    shot: 'adapalm.png',
  },
  {
    name: 'Helthy',
    desc: 'An AI fitness and nutrition app. We designed the app itself, and the site that introduces it.',
    kind: 'App design and website',
    href: 'https://helthy.app',
    shot: 'helthy.png',
  },
  {
    name: 'Temegs Engineering',
    desc: 'A new website and logo for a civil engineering contractor in Port Harcourt, Nigeria.',
    kind: 'Website and logo',
    href: 'https://temegsengineering.com/',
    shot: 'temegs.png',
  },
  {
    name: 'JobScout',
    desc: 'An AI career agent that finds jobs to fit your resume and tracks every application, with accounts and a database behind it.',
    kind: 'Web app',
    href: 'https://jobscout-pi-pied.vercel.app',
    shot: 'jobscout.png',
  },
  {
    name: 'Concepta',
    desc: 'A site for an IT and cybersecurity firm serving government and regulated industries, with a page for each service and a quote request form.',
    kind: 'Website',
    href: 'https://www.conceptainnovation.com/',
    shot: 'concepta.png',
  },
];

/**
 * The Starter layouts, each a live demo of a made-up business. They sit in
 * their own group under the client work so nobody mistakes them for clients.
 * All three are served from one Vercel project (vercel.json in oce-starter).
 */
const starters: Project[] = [
  {
    name: 'Restaurant',
    desc: 'La Palma Taquería. It opens with a tortilla press, and the menu is laid out like the printed one on the table.',
    href: 'https://oce-starter-services.vercel.app/restaurant',
    shot: 'starter-restaurant.png',
  },
  {
    name: 'Barbershop',
    desc: "Maceo's. Prices read like the board on the wall, and every barber has their own booking link.",
    href: 'https://oce-starter-services.vercel.app/barbershop',
    shot: 'starter-barbershop.png',
  },
  {
    name: 'Car detailing',
    desc: 'Sheen. Drag the slider to see a car before and after, then check the price for your size of car.',
    href: 'https://oce-starter-services.vercel.app/detailing',
    shot: 'starter-detailing.png',
  },
];

/**
 * Bare host as the caption — more informative than a repeated "Visit →".
 * Keeps the path when there is one. A project still on its host's shared
 * address gets a plain label instead: that address names the hosting
 * company, which client-facing copy never does.
 */
function domainOf(href: string) {
  const url = new URL(href);
  if (url.hostname.endsWith('.vercel.app')) return 'Live demo';
  const path = url.pathname.replace(/\/$/, '');
  return url.hostname.replace(/^www\./, '') + path;
}

function hasAsset(file: string) {
  return fs.existsSync(path.join(process.cwd(), 'public', 'work', file));
}

/**
 * A project gets a hover preview if a same-named .mp4 sits next to its shot.
 * Dropping `name.mp4` into /public/work is all it takes to enable one.
 */
function clipFor(shot: string) {
  const clip = shot.replace(/\.[^.]+$/, '.mp4');
  return hasAsset(clip) ? clip : undefined;
}

/**
 * One project in the grid. `priority` loads the shot eagerly (the top row is
 * above the fold); `heading` is h3 under a section's own h2.
 */
function Card({
  project,
  index,
  priority = false,
  heading: Heading = 'h2',
}: {
  project: Project;
  index: number;
  priority?: boolean;
  heading?: 'h2' | 'h3';
}) {
  const { name, desc, kind, href, shot } = project;
  return (
    <Reveal className="work-cell">
      <a
        className="work-item"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {hasAsset(shot) ? (
          <WorkPreview
            name={name}
            shot={shot}
            clip={clipFor(shot)}
            // Two-up from 52rem, full width below — matches .work-grid.
            sizes="(max-width: 52rem) 100vw, 50vw"
            priority={priority}
          />
        ) : (
          <div className="work-shot work-shot--empty">
            <span>{name}</span>
          </div>
        )}

        <div className="work-head">
          <span className="work-num">{String(index + 1).padStart(2, '0')}</span>
          <Heading className="work-name">{name}</Heading>
          {kind && <span className="work-kind">{kind}</span>}
        </div>
        <p className="work-desc">{desc}</p>
        <span className="work-domain">{domainOf(href)}</span>
      </a>
    </Reveal>
  );
}

export default function WorkPage() {
  return (
    <>
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">Selected projects.</h1>
      </header>

      <section className="shell work-grid">
        {projects.map((p, i) => (
          // The top row is above the fold; later rows load lazily.
          <Card key={p.name} project={p} index={i} priority={i < 2} />
        ))}

        {/* Sits after the last project (filling the odd cell when the count is
            odd) and puts a next step where the eye already lands. */}
        <Reveal className="work-cell work-cell--cta">
          <p className="work-cta-lede">Have something in mind?</p>
          <Link href="/contact" className="block block--primary">
            Start a project <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
        </Reveal>
      </section>

      {/* Starter links here by id, so keep it. */}
      <section id="templates" className="shell work-starters">
        <Reveal className="sec-head">
          <p className="eyebrow">Starter templates</p>
          <h2 className="h2">Made for local businesses.</h2>
          <p className="sec-lede">
            These are demo sites for businesses we made up. Pick the one closest to yours and we&apos;ll swap in your
            name, photos, colours and prices.{' '}
            <Link href="/starter" className="text-link">
              How Starter works
            </Link>
          </p>
        </Reveal>
        <div className="work-grid">
          {starters.map((p, i) => (
            <Card key={p.name} project={p} index={i} heading="h3" />
          ))}
        </div>
      </section>
    </>
  );
}

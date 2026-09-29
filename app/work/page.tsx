import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';

export const metadata: Metadata = {
  title: 'Work — OCE Labs',
  description: 'Selected projects from OCE Labs.',
};

type Project = {
  name: string;
  desc: string;
  href: string;
  /** File in /public/work. Rendered only if it actually exists. */
  shot: string;
};

const projects: Project[] = [
  {
    name: 'Ada Palm',
    desc: 'A New York marketing consultancy site built around a full-bleed showreel.',
    href: 'https://adapalm.com',
    shot: 'adapalm.png',
  },
  {
    name: 'Helthy',
    desc: 'An AI fitness and nutrition platform with tracking and guidance.',
    href: 'https://helthy.app',
    shot: 'helthy.png',
  },
  {
    name: 'JobScout',
    desc: 'An AI career agent that matches jobs to your resume and tracks every application.',
    href: 'https://jobscout-pi-pied.vercel.app',
    shot: 'jobscout.png',
  },
  {
    name: 'Personal Portfolio',
    desc: 'A Next.js portfolio with expressive motion.',
    href: 'https://chibudomonyejesi.com',
    shot: 'portfolio.png',
  },
  {
    name: 'Concepta',
    desc: 'A brand-forward marketing site.',
    href: 'https://www.conceptainnovation.com/',
    shot: 'concepta.png',
  },
];

/** Bare host as the caption — more informative than a repeated "Visit →". */
function domainOf(href: string) {
  return new URL(href).hostname.replace(/^www\./, '');
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

export default function WorkPage() {
  return (
    <>
      <header className="shell page-head">
        <h1 className="h1 rise rise-1">Selected projects.</h1>
      </header>

      <section className="shell work-grid">
        {projects.map(({ name, desc, href, shot }, i) => (
          <Reveal key={name} className="work-cell">
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
                  // The top row is above the fold; later rows load lazily.
                  priority={i < 2}
                />
              ) : (
                <div className="work-shot work-shot--empty">
                  <span>{name}</span>
                </div>
              )}

              <div className="work-head">
                <span className="work-num">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="work-name">{name}</h2>
              </div>
              <p className="work-desc">{desc}</p>
              <span className="work-domain">{domainOf(href)}</span>
            </a>
          </Reveal>
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
    </>
  );
}

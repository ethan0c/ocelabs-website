import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
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
    name: 'Helthy',
    desc: 'An AI fitness and nutrition platform with tracking and guidance.',
    href: 'https://helthy.app',
    shot: 'helthy.png',
  },
  {
    name: 'Concepta',
    desc: 'A brand-forward marketing site.',
    href: 'https://concepta-five.vercel.app/',
    shot: 'concepta.png',
  },
  {
    name: 'Personal Portfolio',
    desc: 'A Next.js portfolio with expressive motion.',
    href: 'https://chibudomonyejesi.com',
    shot: 'portfolio.png',
  },
];

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
        <p className="eyebrow rise rise-1">Work</p>
        <h1 className="h1 rise rise-2">Selected projects.</h1>
      </header>

      <section className="shell work-list">
        {projects.map(({ name, desc, href, shot }, i) => (
          <Reveal key={name}>
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
                  // Only the first shot is above the fold; the rest load lazily.
                  priority={i === 0}
                />
              ) : (
                <div className="work-shot work-shot--empty">
                  <span>{name}</span>
                </div>
              )}

              <div className="work-head">
                <h2 className="work-name">{name}</h2>
                <span className="work-go">Visit &rarr;</span>
              </div>
              <p className="work-desc">{desc}</p>
            </a>
          </Reveal>
        ))}
      </section>
    </>
  );
}

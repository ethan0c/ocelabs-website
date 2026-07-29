import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Image from 'next/image';

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
    name: 'Temegs',
    desc: 'A business website built for clarity and speed.',
    href: 'https://temegs.vercel.app',
    shot: 'temegs.png',
  },
  {
    name: 'Personal Portfolio',
    desc: 'A Next.js portfolio with expressive motion.',
    href: 'https://chibudomonyejesi.com',
    shot: 'portfolio.png',
  },
  {
    name: 'Digital Art & Design',
    desc: 'Illustration and visual design work.',
    href: 'https://instagram.com/ethan.lma',
    shot: 'art.png',
  },
];

function hasShot(file: string) {
  return fs.existsSync(path.join(process.cwd(), 'public', 'work', file));
}

export default function WorkPage() {
  return (
    <>
      <header className="shell page-head">
        <p className="eyebrow rise rise-1">Work</p>
        <h1 className="h1 rise rise-2">Selected projects.</h1>
      </header>

      <section className="shell work-list">
        {projects.map(({ name, desc, href, shot }) => (
          <a
            key={name}
            className="work-item"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={`work-shot${hasShot(shot) ? '' : ' work-shot--empty'}`}>
              {hasShot(shot) ? (
                <Image
                  src={`/work/${shot}`}
                  alt={`${name} screenshot`}
                  width={1200}
                  height={750}
                  sizes="(max-width: 68rem) 100vw, 64rem"
                />
              ) : (
                <span>{name}</span>
              )}
            </div>

            <div className="work-head">
              <h2 className="work-name">{name}</h2>
              <span className="work-go">Visit &rarr;</span>
            </div>
            <p className="work-desc">{desc}</p>
          </a>
        ))}
      </section>
    </>
  );
}

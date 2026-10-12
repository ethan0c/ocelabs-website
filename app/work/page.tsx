import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import WorkPreview from '@/components/WorkPreview';
import { clipFor, domainOf, hasAsset, projects, starters, type Project } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Work — OCE Labs',
  description: 'Websites and apps we have designed and built for clients.',
};

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
        {/* Says whose work it is: the Starter demos further down are not clients'. */}
        <h1 className="h1 rise rise-1">Work we&apos;ve done for clients.</h1>
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

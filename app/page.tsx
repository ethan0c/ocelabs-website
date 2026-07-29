import Link from 'next/link';
import Reveal from '@/components/Reveal';

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
];

export default function HomePage() {
  return (
    <>
      <section className="shell hero">
        <h1 className="h1 hero-title rise rise-1">
          We build websites, apps, and the brands around them.
        </h1>
        <p className="lede rise rise-2">
          We work in what&apos;s left after the excess is gone. Every element earns its
          place or it goes — because clarity is not what you add, it&apos;s what you
          refuse to. Restraint is the whole discipline.
        </p>
        <div className="hero-links rise rise-3">
          <Link href="/work" className="ulink">
            See the work
          </Link>
          <Link href="/contact" className="ulink ulink--muted">
            Start a project
          </Link>
        </div>
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
      </section>
    </>
  );
}

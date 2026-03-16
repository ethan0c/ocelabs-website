import Link from 'next/link';
import GsapPageEffects from '../../components/GsapPageEffects';

const projects = [
  {
    number: '01',
    title: 'Personal Brand Portfolio',
    description: 'A React Next.js portfolio with expressive motion and clear storytelling.',
    tags: ['React', 'Next.js', 'Motion'],
    href: 'https://chibudomonyejesi.com',
    embedHref: 'https://chibudomonyejesi.com'
  },
  {
    number: '02',
    title: 'Digital Art & Design Work',
    description: 'Illustration and visual design work that extends product identity across channels.',
    tags: ['Illustration', 'UI Design', 'Branding'],
    href: 'https://instagram.com/ethan.lma'
  },
  {
    number: '03',
    title: 'Helthy - AI Fitness Platform',
    description: 'An AI-powered fitness and nutrition product with smart guidance and tracking.',
    tags: ['AI', 'React Native', 'Full Stack'],
    href: 'https://helthy.app',
    embedHref: 'https://helthy.app'
  },
  {
    number: '04',
    title: 'Temegs Website',
    description: 'A clean business website centered on clarity, speed, and responsive behavior.',
    tags: ['Web Development', 'Responsive', 'Frontend'],
    href: 'https://temegs.vercel.app',
    embedHref: 'https://temegs.vercel.app'
  },
  {
    number: '05',
    title: 'Concepta Website',
    description: 'Brand-forward marketing site with careful pacing and production-ready polish.',
    tags: ['Brand Website', 'UI Direction', 'Performance'],
    href: 'https://concepta-five.vercel.app/',
    embedHref: 'https://concepta-five.vercel.app/'
  }
];

export default function WorkPage() {
  return (
    <>
      <main>
        <section className="work section-shell section-shell--subpage" style={{ paddingTop: 'calc(var(--nav-height) + 2.4rem)' }}>
          <div className="container">
            <header className="section-header" data-gsap="reveal-header">
              <p className="section-kicker">Selected Work</p>
              <h2 className="section-title">
                <span className="section-title-line section-title-line--muted">PROJECTS WITH A</span>
                <span className="section-title-line">SHARP POINT</span>
                <span className="section-title-line section-title-line--accent">OF VIEW</span>
              </h2>
              <p className="section-subtitle">Brand experiences, product builds, and growth systems shipped with intent.</p>
            </header>

            <div className="work-grid">
              {projects.map((project) => (
                <article key={project.number} className="work-item" data-gsap="work-item">
                  <div className="work-preview" aria-hidden="true">
                    {project.embedHref ? (
                      <iframe
                        className="work-preview-frame"
                        title={`${project.title} demo preview`}
                        src={project.embedHref}
                        loading="lazy"
                      />
                    ) : (
                      <div className="work-preview-fallback">
                        <p>External demo only</p>
                      </div>
                    )}
                  </div>

                  <div className="work-item-body">
                    <span className="work-number">{project.number}</span>
                    <h3 className="work-title">{project.title}</h3>
                    <p className="work-description">{project.description}</p>
                    <div className="work-meta">
                      {project.tags.map((tag) => (
                        <span key={tag} className="work-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="work-actions">
                    <a href={project.href} className="work-link" target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                    <a href={project.href} className="work-link work-link--ghost" target="_blank" rel="noopener noreferrer">
                      Open Fullscreen
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="work-cta" data-gsap="reveal-header">
              <p>Want to see your project here?</p>
              <Link href="/contact" className="btn btn-primary">
                Let&apos;s Build Something
              </Link>
            </div>
          </div>
        </section>
      </main>

      <GsapPageEffects page="work" />
    </>
  );
}

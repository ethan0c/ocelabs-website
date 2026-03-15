import GsapPageEffects from '../../components/GsapPageEffects';
import ServicesInteractive from '../../components/services/ServicesInteractive';

export default function ServicesPage() {
  return (
    <>
      <main>
        <section className="services section-shell section-shell--subpage" style={{ paddingTop: 'calc(var(--nav-height) + 2.4rem)' }}>
          <div className="container">
            <header className="section-header" data-gsap="reveal-header">
              <p className="section-kicker">What We Do</p>
              <h2 className="section-title">
                <span className="section-title-line">SERVICES ENGINEERED</span>
                <span className="section-title-line section-title-line--accent">FOR MOMENTUM</span>
              </h2>
              <p className="section-subtitle">
                Clear scope, transparent pricing, and technical quality from kickoff to launch.
              </p>
            </header>

            <ServicesInteractive />
          </div>
        </section>
      </main>

      <GsapPageEffects page="services" />
    </>
  );
}

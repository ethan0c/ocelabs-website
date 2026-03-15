import { Suspense } from 'react';
import { IoLogoLinkedin, IoMailOpenOutline, IoMailOutline, IoTimeOutline } from 'react-icons/io5';
import GsapPageEffects from '../../components/GsapPageEffects';
import ContactForm from '../../components/contact/ContactForm';

export default function ContactPage() {
  return (
    <>
      <main>
        <section className="contact section-shell section-shell--subpage" id="contact" style={{ paddingTop: 'calc(var(--nav-height) + 2.4rem)' }}>
          <div className="container">
            <header className="section-header" data-gsap="reveal-header">
              <p className="section-kicker">Let&apos;s Talk</p>
              <h2 className="section-title">
                <span className="section-title-line">READY TO BUILD</span>
                <span className="section-title-line section-title-line--accent">SOMETHING</span>
                <span className="section-title-line section-title-line--muted">SERIOUS?</span>
              </h2>
              <p className="section-subtitle">
                Tell us where you are, where you want to go, and we will map the fastest route.
              </p>
            </header>

            <div className="contact-content">
              <div className="contact-info" data-gsap="contact-left">
                <p className="contact-text">
                  Whether you need a high-converting website, a product MVP, or a complete visual system, OCE Labs can
                  design and ship it with precision.
                </p>
                <div className="contact-detail-cards">
                  <div className="contact-detail-card">
                    <IoMailOpenOutline />
                    <div>
                      <span>Email</span>
                      <a href="mailto:contact@ocelabs.tech">contact@ocelabs.tech</a>
                    </div>
                  </div>
                  <div className="contact-detail-card">
                    <IoTimeOutline />
                    <div>
                      <span>Response Window</span>
                      <p>Usually within 24 hours</p>
                    </div>
                  </div>
                </div>
                <div className="contact-details">
                  <a href="mailto:contact@ocelabs.tech" className="contact-icon-link" aria-label="Email">
                    <IoMailOutline />
                  </a>
                  <a
                    href="https://linkedin.com/in/chibudom-onyejesi"
                    className="contact-icon-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <IoLogoLinkedin />
                  </a>
                  <span className="response-time">Open for projects Q2 2026</span>
                </div>
              </div>

              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      <GsapPageEffects page="contact" />
    </>
  );
}

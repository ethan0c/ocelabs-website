import { Suspense } from 'react';
import GsapPageEffects from '../../components/GsapPageEffects';
import ContactForm from '../../components/contact/ContactForm';
import ContactAmbientCard from '../../components/contact/ContactAmbientCard';

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
              <ContactAmbientCard />

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

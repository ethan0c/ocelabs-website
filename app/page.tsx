import GsapPageEffects from '../components/GsapPageEffects';
import HomeHeroTitle from '../components/home/HomeHeroTitle';

export default function HomePage() {
  return (
    <>
      <main className="landing-main">
        <section className="hero hero--scene">
          <div className="caps-orbit" aria-hidden="true">
            <span className="orbit-label orbit-label--tl">PRODUCT STRATEGY</span>
            <span className="orbit-label orbit-label--tr">CREATIVE ENGINEERING</span>
            <span className="orbit-label orbit-label--bl">MOTION SYSTEMS</span>
            <span className="orbit-label orbit-label--br">FAST ITERATION</span>
            <span className="orbit-label orbit-label--ml">BRAND EDGE</span>
            <span className="orbit-label orbit-label--mr">WEB + APP BUILDS</span>
          </div>

          <div className="container hero-center" data-gsap="hero-copy">
            <div className="hero-copy hero-copy--center">
              <p className="hero-eyebrow">Creative Engineering Studio</p>
              <HomeHeroTitle />
              <p className="hero-subtitle">
                OCE Labs turns ideas into high-performance products with a strong visual voice, deep frontend
                craft, and motion that feels alive.
              </p>
            </div>

            <div className="figure-layer" data-gsap="hero-figures" aria-hidden="true">
              <div className="shape shape--ring" />
              <div className="shape shape--cube" />
              <div className="shape shape--diamond" />
              <div className="shape shape--orb" />
              <div className="shape shape--grid" />
            </div>
          </div>
        </section>
      </main>

      <GsapPageEffects page="home" />
    </>
  );
}

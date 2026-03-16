'use client';

import { useRef, useState } from 'react';
import { IoGlobeOutline, IoPhonePortraitOutline, IoColorWandOutline } from 'react-icons/io5';

type ServiceType = 'web' | 'mobile' | 'design';

type ServiceCardProps = {
  type: ServiceType;
  index: string;
  title: string;
  description: string;
  deliverables: string[];
  priceFrom: string;
  priceRange: string;
  demoHref: string;
  isActive: boolean;
  onActivate: (type: ServiceType) => void;
  onQuote: (type: ServiceType) => void;
};

function ServiceIcon({ type }: { type: ServiceType }) {
  if (type === 'web') {
    return <IoGlobeOutline />;
  }
  if (type === 'mobile') {
    return <IoPhonePortraitOutline />;
  }
  return <IoColorWandOutline />;
}

export default function ServiceCard({
  type,
  index,
  title,
  description,
  deliverables,
  priceFrom,
  priceRange,
  demoHref,
  isActive,
  onActivate,
  onQuote
}: ServiceCardProps) {
  const [previewPos, setPreviewPos] = useState<{ left: number; top: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcPos = (clientX: number, clientY: number) => {
    const W = 324, H = 210;
    const left = clientX < window.innerWidth * 0.55 ? clientX + 22 : clientX - W - 22;
    const top = clientY < window.innerHeight * 0.65 ? clientY + 22 : clientY - H - 22;
    return { left, top };
  };

  const onDemoEnter = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    timerRef.current = setTimeout(() => setPreviewPos(calcPos(clientX, clientY)), 160);
  };

  const onDemoMove = (e: React.MouseEvent) => {
    if (previewPos) setPreviewPos(calcPos(e.clientX, e.clientY));
  };

  const onDemoLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPreviewPos(null);
  };

  return (
    <article
      className={`service-card service-card--${type}${isActive ? ' is-active' : ''}`}
      data-gsap="service-card"
      data-service-card
      data-service-type={type}
      onMouseEnter={() => onActivate(type)}
      onFocus={() => onActivate(type)}
    >
      <span className="service-card-ambient" aria-hidden="true" />
      <span className="service-card-grid" aria-hidden="true" />
      <span className="service-card-ring" aria-hidden="true" />

      <div className="service-card-shell">
        <div className="service-top-row">
          <div className="service-icon service-layer">
            <ServiceIcon type={type} />
          </div>
          <span className="service-index service-layer">{index}</span>
        </div>

        <div className="service-head service-layer">
          <h3 className="service-title">{title}</h3>
        </div>

        <p className="service-description service-layer">{description}</p>

        <div className="service-deliverables service-layer" aria-label={`${title} deliverables`}>
          {deliverables.map((item) => (
            <span key={item} className="service-deliverable-pill">
              {item}
            </span>
          ))}
        </div>

        <div className="service-pricing-container service-layer">
          <div className="pricing-summary">
            <span className="pricing-kicker">Investment</span>
            <div className="pricing-from">{priceFrom}</div>
            <div className="pricing-range">{priceRange}</div>
          </div>
        </div>

        <div className="service-actions service-layer">
          <div
            className="demo-link-wrap"
            onMouseEnter={onDemoEnter}
            onMouseMove={onDemoMove}
            onMouseLeave={onDemoLeave}
          >
            <a href={demoHref} className="service-demo-link" target="_blank" rel="noopener noreferrer">
              View Demo
            </a>
            {previewPos && (
              <div
                className="demo-preview-popup"
                style={{ left: previewPos.left, top: previewPos.top }}
                aria-hidden="true"
              >
                <div className="demo-preview-header">
                  <span className="demo-preview-url">{demoHref.replace('https://', '')}</span>
                  <span className="demo-preview-live">LIVE</span>
                </div>
                <div className="demo-preview-frame-wrap">
                  <iframe
                    className="demo-preview-frame"
                    src={demoHref}
                    title={`Live preview of ${demoHref}`}
                    loading="lazy"
                    tabIndex={-1}
                  />
                  <div className="demo-preview-guard" />
                </div>
              </div>
            )}
          </div>
          <button className="price-estimator-btn" type="button" onClick={() => onQuote(type)}>
            Get Custom Quote
          </button>
        </div>
      </div>
    </article>
  );
}

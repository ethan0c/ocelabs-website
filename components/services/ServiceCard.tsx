'use client';

import { useState } from 'react';
import { IoGlobeOutline, IoInformationCircle, IoInformationCircleOutline, IoPhonePortraitOutline, IoColorWandOutline } from 'react-icons/io5';

type ServiceType = 'web' | 'mobile' | 'design';

type ServiceCardProps = {
  type: ServiceType;
  index: string;
  title: string;
  description: string;
  priceFrom: string;
  priceRange: string;
  factors: string;
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
  priceFrom,
  priceRange,
  factors,
  onQuote
}: ServiceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article className="service-card" data-gsap="service-card">
      <div className="service-icon">
        <ServiceIcon type={type} />
      </div>
      <div className="service-head">
        <span className="service-index">{index}</span>
        <h3 className="service-title">{title}</h3>
      </div>
      <p className="service-description">{description}</p>
      <div className="service-pricing-container">
        <div className="pricing-compact">
          <span className="pricing-from">{priceFrom}</span>
          <button
            className="pricing-details-btn"
            type="button"
            onClick={() => setShowDetails((previous) => !previous)}
          >
            <IoInformationCircleOutline />
            View Details
          </button>
        </div>
        <div className="pricing-details" style={{ display: showDetails ? 'block' : 'none' }}>
          <div className="pricing-range">{priceRange}</div>
          <div className="pricing-factors">
            <IoInformationCircle />
            {factors}
          </div>
        </div>
      </div>
      <button className="price-estimator-btn" type="button" onClick={() => onQuote(type)}>
        Get Custom Quote
      </button>
    </article>
  );
}

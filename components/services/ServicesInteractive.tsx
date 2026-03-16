'use client';

import { useEffect, useState } from 'react';
import PriceEstimatorModal from './PriceEstimatorModal';
import ServiceCard from './ServiceCard';

type ServiceType = 'web' | 'mobile' | 'design' | 'consulting';
type CardServiceType = Exclude<ServiceType, 'consulting'>;

export default function ServicesInteractive() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<ServiceType>('web');
  const [highlightedType, setHighlightedType] = useState<CardServiceType>('web');

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const openEstimator = (type: ServiceType) => {
    setActiveType(type);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEstimator = () => {
    setIsModalOpen(false);
    setActiveType('web');
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="services-grid services-grid--experimental" data-service-scene>
        <ServiceCard
          type="web"
          index="01"
          title="Web Development"
          description="Responsive websites and web apps with strong architecture and clean interactions."
          deliverables={['Marketing Sites', 'Web Apps', 'Performance Pass']}
          priceFrom="From $1,500"
          priceRange="Typically $1,500 - $7,500"
          demoHref="https://temegs.vercel.app"
          isActive={highlightedType === 'web'}
          onActivate={setHighlightedType}
          onQuote={openEstimator}
        />
        <ServiceCard
          type="mobile"
          index="02"
          title="Mobile Apps"
          description="Cross-platform React Native and native iOS products from planning to launch."
          deliverables={['iOS + Android', 'Backend Integration', 'App Store Support']}
          priceFrom="From $3,000"
          priceRange="Typically $3,000 - $8,500"
          demoHref="https://helthy.app"
          isActive={highlightedType === 'mobile'}
          onActivate={setHighlightedType}
          onQuote={openEstimator}
        />
        <ServiceCard
          type="design"
          index="03"
          title="Branding + Design"
          description="Visual systems, UI kits, and identity direction that make products memorable."
          deliverables={['Brand Direction', 'UI Systems', 'Design QA']}
          priceFrom="From $750"
          priceRange="Typically $750 - $6,500"
          demoHref="https://concepta-five.vercel.app/"
          isActive={highlightedType === 'design'}
          onActivate={setHighlightedType}
          onQuote={openEstimator}
        />
      </div>

      <PriceEstimatorModal isOpen={isModalOpen} initialType={activeType} onClose={closeEstimator} />
    </>
  );
}

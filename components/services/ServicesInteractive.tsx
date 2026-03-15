'use client';

import { useEffect, useState } from 'react';
import PriceEstimatorModal from './PriceEstimatorModal';
import ServiceCard from './ServiceCard';

type ServiceType = 'web' | 'mobile' | 'design' | 'consulting';

export default function ServicesInteractive() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<ServiceType>('web');

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
      <div className="services-grid">
        <ServiceCard
          type="web"
          index="01"
          title="Web Development"
          description="Responsive websites and web apps with strong architecture and clean interactions."
          priceFrom="From $1,500"
          priceRange="Typically $1,500 - $7,500"
          factors="Depends on pages, integrations, and timeline."
          onQuote={openEstimator}
        />
        <ServiceCard
          type="mobile"
          index="02"
          title="Mobile Apps"
          description="Cross-platform React Native and native iOS products from planning to launch."
          priceFrom="From $3,000"
          priceRange="Typically $3,000 - $8,500"
          factors="Depends on complexity, integrations, and platforms."
          onQuote={openEstimator}
        />
        <ServiceCard
          type="design"
          index="03"
          title="Branding + Design"
          description="Visual systems, UI kits, and identity direction that make products memorable."
          priceFrom="From $750"
          priceRange="Typically $750 - $6,500"
          factors="Depends on deliverables and revision cycles."
          onQuote={openEstimator}
        />
      </div>

      <PriceEstimatorModal isOpen={isModalOpen} initialType={activeType} onClose={closeEstimator} />
    </>
  );
}

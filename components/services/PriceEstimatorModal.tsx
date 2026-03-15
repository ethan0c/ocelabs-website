'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ServiceType = 'web' | 'mobile' | 'design' | 'consulting';

type PriceEstimatorModalProps = {
  isOpen: boolean;
  initialType: ServiceType;
  onClose: () => void;
};

type Feature = {
  label: string;
  value: number;
};

const basePrices: Record<ServiceType, number> = {
  web: 3000,
  mobile: 2000,
  design: 750,
  consulting: 150
};

const timelineOptions = [
  { label: 'Standard (4-8 weeks)', value: '1' },
  { label: 'Expedited (2-4 weeks) +30%', value: '1.3' },
  { label: 'Rush (1-2 weeks) +50%', value: '1.5' }
];

const featureOptions: Feature[] = [
  { label: 'User Authentication/Login', value: 500 },
  { label: 'Payment Processing', value: 800 },
  { label: 'Content Management System', value: 600 },
  { label: 'Database Integration', value: 400 },
  { label: 'Email Notifications', value: 300 },
  { label: 'Admin Dashboard', value: 700 },
  { label: 'API Integration', value: 500 },
  { label: 'Analytics & Reporting', value: 400 }
];

const projectTypeMap: Record<ServiceType, string> = {
  web: 'web-development',
  mobile: 'mobile-app',
  design: 'branding-design',
  consulting: 'it-consulting'
};

const timelineMap: Record<string, string> = {
  '1': 'Standard timeline (4-8 weeks)',
  '1.3': 'Expedited timeline (2-4 weeks)',
  '1.5': 'Rush timeline (1-2 weeks)'
};

export default function PriceEstimatorModal({ isOpen, initialType, onClose }: PriceEstimatorModalProps) {
  const router = useRouter();
  const [type, setType] = useState<ServiceType>(initialType);
  const [timeline, setTimeline] = useState('1');
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setType(initialType);
    setTimeline('1');
    setFeatures([]);
  }, [initialType, isOpen]);

  const estimate = useMemo(() => {
    const base = basePrices[type] || 3000;
    const featureCost = featureOptions
      .filter((feature) => features.includes(feature.label))
      .reduce((sum, feature) => sum + feature.value, 0);

    const total = (base + featureCost) * parseFloat(timeline);
    const min = Math.round(total * 0.8).toLocaleString();
    const max = Math.round(total * 1.2).toLocaleString();

    return `$${min} - $${max}`;
  }, [features, timeline, type]);

  const requestDetailedQuote = () => {
    const preFilledMessage = `Hi! I used your price estimator and I'm interested in:\n\nProject Type: ${type}\nTimeline: ${timelineMap[timeline]}\nFeatures Needed: ${features.join(', ') || 'None selected'}\n\nI'd love to get a detailed quote.`;

    const params = new URLSearchParams({
      type: projectTypeMap[type] || 'web-development',
      timeline: timelineMap[timeline],
      features: features.join(', '),
      message: preFilledMessage
    });

    onClose();
    router.push(`/contact?${params.toString()}`);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div id="price-estimator-modal" className="modal" aria-hidden="false" style={{ display: 'block' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Build Your Custom Quote</h3>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close price estimator">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form id="price-estimator-form" onSubmit={(event) => event.preventDefault()}>
            <div className="estimator-section">
              <label htmlFor="estimator-type">Project Type:</label>
              <select id="estimator-type" value={type} onChange={(event) => setType(event.target.value as ServiceType)}>
                <option value="web">Website Development</option>
                <option value="mobile">Mobile App</option>
                <option value="design">Branding & Design</option>
              </select>
            </div>
            <div className="estimator-section">
              <label>Key Features Needed:</label>
              <div className="checkbox-group">
                {featureOptions.map((feature) => (
                  <label key={feature.label}>
                    <input
                      type="checkbox"
                      checked={features.includes(feature.label)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setFeatures((previous) => [...previous, feature.label]);
                          return;
                        }
                        setFeatures((previous) => previous.filter((item) => item !== feature.label));
                      }}
                    />
                    {feature.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="estimator-section">
              <label htmlFor="estimator-timeline">Timeline:</label>
              <select id="estimator-timeline" value={timeline} onChange={(event) => setTimeline(event.target.value)}>
                {timelineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="estimate-result">
              <h4>Estimated Project Range:</h4>
              <div className="estimate-price" id="estimate-display">
                {estimate}
              </div>
              <p className="estimate-note">This is a preliminary estimate. Let&apos;s tailor it to your exact scope.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={requestDetailedQuote}>
                Request Detailed Quote
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

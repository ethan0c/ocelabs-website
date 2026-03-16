'use client';

import { IoMailOutline, IoTimeOutline, IoLogoLinkedin } from 'react-icons/io5';

export default function ContactAmbientCard() {
  return (
    <div className="ambient-card">
      <div className="ambient-card-row">
        <IoMailOutline className="ambient-card-icon" />
        <div>
          <span className="ambient-card-label">Email</span>
          <a href="mailto:contact@ocelabs.tech" className="ambient-card-value">contact@ocelabs.tech</a>
        </div>
      </div>
      <div className="ambient-card-row">
        <IoTimeOutline className="ambient-card-icon" />
        <div>
          <span className="ambient-card-label">Response</span>
          <p className="ambient-card-value">Within 24 hours</p>
        </div>
      </div>
      <div className="ambient-card-row">
        <IoLogoLinkedin className="ambient-card-icon" />
        <div>
          <span className="ambient-card-label">LinkedIn</span>
          <a
            href="https://linkedin.com/in/chibudom-onyejesi"
            target="_blank"
            rel="noopener noreferrer"
            className="ambient-card-value"
          >
            chibudom-onyejesi
          </a>
        </div>
      </div>
      <span className="ambient-card-status">Open for projects Q2 2026</span>
    </div>
  );
}

'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoGlobe, IoPhonePortrait, IoColorWand, IoBulb, IoArrowForward, IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';

type NoticeType = 'success' | 'error' | 'info';
type NotificationState = { message: string; type: NoticeType } | null;
type FormState = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
};

const defaultForm: FormState = { name: '', email: '', projectType: '', budget: '', message: '' };

const PROJECT_TYPES = [
  { value: 'web-development',  label: 'Web Development',   sub: 'Sites, apps, platforms', Icon: IoGlobe },
  { value: 'mobile-app',       label: 'Mobile App',        sub: 'iOS & Android',           Icon: IoPhonePortrait },
  { value: 'branding-design',  label: 'Branding & Design', sub: 'Identity, systems, UI',   Icon: IoColorWand },
  { value: 'it-consulting',    label: 'IT Consulting',      sub: 'Strategy & audits',       Icon: IoBulb },
];

const BUDGET_STOPS = [
  { value: 'under-1k', label: 'Under $1K' },
  { value: '1k-3k',    label: '$1K–3K' },
  { value: '3k-10k',   label: '$3K–10K' },
  { value: '10k-plus', label: '$10K+' },
  { value: 'discuss',  label: 'Let\'s Talk' },
];

const STEP_LABELS = ['WHO', 'WHAT', 'SCOPE', 'BRIEF'];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [charCount, setCharCount] = useState(0);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const requestMessage = useMemo(() => searchParams?.get('message') || '', [searchParams]);
  const requestType = useMemo(() => searchParams?.get('type') || '', [searchParams]);

  useEffect(() => {
    if (!requestMessage && !requestType) return;
    setFormState((prev) => ({
      ...prev,
      projectType: requestType || prev.projectType,
      message: requestMessage || prev.message,
    }));
  }, [requestMessage, requestType]);

  useEffect(() => {
    if (!notification) return;
    const id = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(id);
  }, [notification]);

  // Animate progress bar
  useEffect(() => {
    if (!progressBarRef.current) return;
    const pct = ((step + 1) / STEP_LABELS.length) * 100;
    progressBarRef.current.style.width = `${pct}%`;
  }, [step]);

  // Animate step transition
  const goTo = (next: number) => {
    if (isAnimating) return;
    const dir = next > step ? 'forward' : 'back';
    setIsAnimating(true);

    void import('gsap').then((mod) => {
      const gsap = mod.gsap ?? mod.default;
      const container = stepsRef.current;
      if (!gsap || !container) {
        setStep(next);
        setIsAnimating(false);
        return;
      }

      const outX = dir === 'forward' ? '-60px' : '60px';
      const inX  = dir === 'forward' ? '60px'  : '-60px';

      gsap.to(container, {
        opacity: 0,
        x: outX,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          setStep(next);
          gsap.fromTo(container,
            { opacity: 0, x: inX },
            { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out', onComplete: () => setIsAnimating(false) }
          );
        }
      });
    });
  };

  const advance = () => {
    if (step === 0 && (!formState.name || !formState.email)) {
      setNotification({ message: 'Please fill in your name and email.', type: 'error' });
      return;
    }
    if (step === 0 && !isValidEmail(formState.email)) {
      setNotification({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    if (step === 1 && !formState.projectType) {
      setNotification({ message: 'Please select a project type.', type: 'error' });
      return;
    }
    if (step === 2 && !formState.budget) {
      setNotification({ message: 'Please select a budget range.', type: 'error' });
      return;
    }
    goTo(step + 1);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.message) {
      setNotification({ message: 'Please write a brief message.', type: 'error' });
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', formState.name);
    formData.append('email', formState.email);
    formData.append('project-type', formState.projectType);
    formData.append('budget', formState.budget);
    formData.append('message', formState.message);

    try {
      const response = await fetch('https://formspree.io/f/movldbbk', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        setSubmitted(true);
        return;
      }

      const data = (await response.json()) as { errors?: Array<{ message?: string }> };
      const msg = data.errors?.[0]?.message ?? 'Sorry, there was a problem sending your message.';
      setNotification({ message: msg, type: 'error' });
    } catch {
      setNotification({ message: 'Sorry, there was a problem sending your message.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetIndex = BUDGET_STOPS.findIndex((b) => b.value === formState.budget);

  return (
    <>
      {notification && (
        <div className={`bw-notification bw-notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="brief-wizard" data-gsap="contact-right">
        {/* Progress bar */}
        <div className="bw-progress-track">
          <div className="bw-progress-bar" ref={progressBarRef} />
          <div className="bw-progress-shimmer" />
        </div>

        {/* Step labels */}
        <div className="bw-step-labels">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`bw-step-label ${i === step ? 'bw-step-label--active' : ''} ${i < step ? 'bw-step-label--done' : ''}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Steps viewport */}
        {submitted ? (
          <div className="bw-success">
            <div className="bw-success-icon">
              <IoCheckmarkCircle />
            </div>
            <p className="bw-success-heading">BRIEF RECEIVED</p>
            <p className="bw-success-sub">We&apos;ll be in touch within 24 hours.</p>
          </div>
        ) : (
          <div className="bw-steps" ref={stepsRef}>

            {/* ── Step 0: WHO ── */}
            {step === 0 && (
              <div className="bw-step">
                <span className="bw-ghost-num">01</span>
                <p className="bw-step-prompt">Who are we talking to?</p>
                <div className="bw-field-row">
                  <div className="bw-field">
                    <label className="bw-label" htmlFor="bw-name">Name</label>
                    <input
                      id="bw-name"
                      className="bw-input"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      value={formState.name}
                      onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="bw-field">
                    <label className="bw-label" htmlFor="bw-email">Email</label>
                    <input
                      id="bw-email"
                      className="bw-input"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={formState.email}
                      onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="bw-actions">
                  <button type="button" className="bw-btn bw-btn--primary" onClick={advance}>
                    Continue <IoArrowForward />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 1: WHAT ── */}
            {step === 1 && (
              <div className="bw-step">
                <span className="bw-ghost-num">02</span>
                <p className="bw-step-prompt">What are we building?</p>
                <div className="bw-type-grid">
                  {PROJECT_TYPES.map(({ value, label, sub, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`bw-type-tile ${formState.projectType === value ? 'bw-type-tile--selected' : ''}`}
                      onClick={() => setFormState((p) => ({ ...p, projectType: value }))}
                    >
                      <Icon className="bw-tile-icon" />
                      <span className="bw-tile-label">{label}</span>
                      <span className="bw-tile-sub">{sub}</span>
                    </button>
                  ))}
                </div>
                <div className="bw-actions">
                  <button type="button" className="bw-btn bw-btn--ghost" onClick={() => goTo(0)}>
                    <IoArrowBack /> Back
                  </button>
                  <button type="button" className="bw-btn bw-btn--primary" onClick={advance}>
                    Continue <IoArrowForward />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: SCOPE ── */}
            {step === 2 && (
              <div className="bw-step">
                <span className="bw-ghost-num">03</span>
                <p className="bw-step-prompt">What&apos;s the budget?</p>
                <div className="bw-budget-track">
                  <div className="bw-budget-stops">
                    {BUDGET_STOPS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        className={`bw-budget-stop ${formState.budget === value ? 'bw-budget-stop--active' : ''}`}
                        onClick={() => setFormState((p) => ({ ...p, budget: value }))}
                      >
                        <span className="bw-budget-dot" />
                        <span className="bw-budget-label">{label}</span>
                      </button>
                    ))}
                  </div>
                  {/* fill line */}
                  <div className="bw-budget-line">
                    <div
                      className="bw-budget-fill"
                      style={{ width: budgetIndex >= 0 ? `${(budgetIndex / (BUDGET_STOPS.length - 1)) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                {formState.budget && (
                  <p className="bw-budget-selected">
                    Selected: <strong>{BUDGET_STOPS.find((b) => b.value === formState.budget)?.label}</strong>
                  </p>
                )}
                <div className="bw-actions">
                  <button type="button" className="bw-btn bw-btn--ghost" onClick={() => goTo(1)}>
                    <IoArrowBack /> Back
                  </button>
                  <button type="button" className="bw-btn bw-btn--primary" onClick={advance}>
                    Continue <IoArrowForward />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: BRIEF ── */}
            {step === 3 && (
              <form className="bw-step" onSubmit={submitForm}>
                <span className="bw-ghost-num">04</span>
                <p className="bw-step-prompt">Tell us everything.</p>
                <div className="bw-field bw-field--full">
                  <label className="bw-label" htmlFor="bw-message">Project brief</label>
                  <textarea
                    id="bw-message"
                    className="bw-input bw-textarea"
                    placeholder="What are you building, why does it matter, what's the timeline..."
                    rows={7}
                    maxLength={1200}
                    value={formState.message}
                    onChange={(e) => {
                      setFormState((p) => ({ ...p, message: e.target.value }));
                      setCharCount(e.target.value.length);
                    }}
                  />
                  <span className="bw-char-count">{charCount} / 1200</span>
                </div>
                <div className="bw-actions">
                  <button type="button" className="bw-btn bw-btn--ghost" onClick={() => goTo(2)}>
                    <IoArrowBack /> Back
                  </button>
                  <button type="submit" className="bw-btn bw-btn--primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send Brief'} {!isSubmitting && <IoArrowForward />}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}
      </div>
    </>
  );
}

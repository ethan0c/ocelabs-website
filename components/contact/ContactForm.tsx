'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type NoticeType = 'success' | 'error' | 'info';

type NotificationState = {
  message: string;
  type: NoticeType;
} | null;

type FormState = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
};

const defaultForm: FormState = {
  name: '',
  email: '',
  projectType: '',
  budget: '',
  message: ''
};

function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);

  const requestMessage = useMemo(() => searchParams?.get('message') || '', [searchParams]);
  const requestType = useMemo(() => searchParams?.get('type') || '', [searchParams]);

  useEffect(() => {
    if (!requestMessage && !requestType) {
      return;
    }

    setFormState((previous) => ({
      ...previous,
      projectType: requestType || previous.projectType,
      message: requestMessage || previous.message
    }));
  }, [requestMessage, requestType]);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification]);

  const showNotification = (message: string, type: NoticeType) => {
    setNotification({ message, type });
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, email, projectType, budget, message } = formState;

    if (!name || !email || !projectType || !budget || !message) {
      showNotification('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('project-type', projectType);
    formData.append('budget', budget);
    formData.append('message', message);

    try {
      const response = await fetch('https://formspree.io/f/movldbbk', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        showNotification('Thank you! Your message has been sent successfully.', 'success');
        setFormState(defaultForm);
        return;
      }

      const data = (await response.json()) as { errors?: Array<{ message?: string }> };
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        showNotification(data.errors[0].message, 'error');
        return;
      }

      showNotification('Sorry, there was a problem sending your message.', 'error');
    } catch {
      showNotification('Sorry, there was a problem sending your message.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {notification ? (
        <div
          className={`notification notification-${notification.type}`}
          style={{
            position: 'fixed',
            top: 92,
            right: 16,
            zIndex: 9999,
            background: notification.type === 'success' ? '#0f0e13' : '#fff',
            color: notification.type === 'success' ? '#fff' : '#111',
            border: '1px solid #111',
            borderRadius: 999,
            padding: '0.7rem 1rem',
            fontSize: '0.76rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          {notification.message}
        </div>
      ) : null}

      <form className="contact-form" id="contact-form" onSubmit={submitForm} data-gsap="contact-right">
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            required
            value={formState.name}
            onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
            required
            value={formState.email}
            onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <select
            id="project-type"
            name="project-type"
            required
            value={formState.projectType}
            onChange={(event) => setFormState((previous) => ({ ...previous, projectType: event.target.value }))}
          >
            <option value="">Select Project Type</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-app">Mobile App</option>
            <option value="branding-design">Branding & Design</option>
            <option value="it-consulting">IT Consulting</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <select
            id="budget"
            name="budget"
            required
            value={formState.budget}
            onChange={(event) => setFormState((previous) => ({ ...previous, budget: event.target.value }))}
          >
            <option value="">Budget Range</option>
            <option value="under-1k">Under $1,000</option>
            <option value="1k-3k">$1,000 - $3,000</option>
            <option value="3k-10k">$3,000 - $10,000</option>
            <option value="10k-plus">$10,000+</option>
            <option value="discuss">Let&apos;s Discuss</option>
          </select>
        </div>
        <div className="form-group">
          <textarea
            id="message"
            name="message"
            placeholder="Tell us about your project..."
            rows={6}
            required
            value={formState.message}
            onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Request Free Strategy Call'}
        </button>
        <div className="form-testimonial">
          <p>
            <em>&quot;OCE Labs delivered exactly what we needed - on time and beyond expectations.&quot;</em>
          </p>
          <span>- Sarah M., Startup Founder</span>
        </div>
      </form>
    </>
  );
}

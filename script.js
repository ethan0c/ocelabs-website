document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    initThemeToggle();
    initMobileMenu(navToggle, navMenu, navOverlay, navLinks);
    initSmoothAnchors();
    initActiveNav(navLinks);
    initGsapAnimations();
    initMagneticButtons();
    initContactForm();

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu(navToggle, navMenu, navOverlay);
            const modal = document.getElementById('price-estimator-modal');
            if (modal && modal.style.display === 'block') {
                closePriceEstimator();
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target === navOverlay) {
            closeMobileMenu(navToggle, navMenu, navOverlay);
        }

        const modal = document.getElementById('price-estimator-modal');
        if (event.target === modal) {
            closePriceEstimator();
        }
    });
});

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = prefersDark.matches ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', savedTheme || defaultTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    prefersDark.addEventListener('change', (event) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
        }
    });
}

function initMobileMenu(navToggle, navMenu, navOverlay, navLinks) {
    if (!navToggle || !navMenu || !navOverlay) {
        return;
    }

    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileMenu(navToggle, navMenu, navOverlay);
        });
    });
}

function closeMobileMenu(navToggle, navMenu, navOverlay) {
    if (!navToggle || !navMenu || !navOverlay) {
        return;
    }

    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            if (!target) {
                return;
            }

            event.preventDefault();
            const top = target.offsetTop - 72;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

function initActiveNav(navLinks) {
    const sections = document.querySelectorAll('section[id]');

    const update = () => {
        let current = 'home';

        sections.forEach((section) => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;

            if (window.scrollY >= top && window.scrollY < top + height) {
                current = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initGsapAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.nav', { y: -30, opacity: 0, duration: 0.6 })
        .from('.hero-eyebrow', { y: 24, opacity: 0, duration: 0.5 }, '-=0.2')
        .from('.title-line', { yPercent: 110, opacity: 0, stagger: 0.08, duration: 0.75 }, '-=0.1')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.55 }, '-=0.25')
        .from('.hero-buttons .btn', { y: 16, opacity: 0, stagger: 0.1, duration: 0.45 }, '-=0.2')
        .from('.hero-rail .rail-card', { x: 24, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.35');

    gsap.utils.toArray('[data-gsap="reveal-header"]').forEach((header) => {
        gsap.from(header, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 80%'
            }
        });
    });

    gsap.utils.toArray('[data-gsap="service-card"]').forEach((card, index) => {
        gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            delay: index * 0.04,
            scrollTrigger: {
                trigger: card,
                start: 'top 86%'
            }
        });
    });

    gsap.utils.toArray('[data-gsap="credibility-item"]').forEach((item, index) => {
        gsap.from(item, {
            y: 34,
            opacity: 0,
            duration: 0.55,
            delay: index * 0.05,
            scrollTrigger: {
                trigger: item,
                start: 'top 86%'
            }
        });
    });

    gsap.utils.toArray('[data-gsap="work-item"]').forEach((item, index) => {
        gsap.from(item, {
            y: 48,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.035,
            scrollTrigger: {
                trigger: item,
                start: 'top 88%'
            }
        });
    });

    gsap.from('[data-gsap="contact-left"]', {
        x: -30,
        opacity: 0,
        duration: 0.65,
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 76%'
        }
    });

    gsap.from('[data-gsap="contact-right"]', {
        x: 30,
        opacity: 0,
        duration: 0.65,
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 76%'
        }
    });

    gsap.to('.glow-a', {
        yPercent: 25,
        xPercent: 12,
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8
        }
    });

    gsap.to('.glow-b', {
        yPercent: -18,
        xPercent: -8,
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.9
        }
    });
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .price-estimator-btn');

    buttons.forEach((button) => {
        button.addEventListener('mousemove', (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const projectType = formData.get('project-type');
        const budget = formData.get('budget');
        const message = formData.get('message');

        if (!name || !email || !projectType || !budget || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
        })
            .then((response) => {
                if (response.ok) {
                    showNotification('Thank you! Your message has been sent successfully.', 'success');
                    form.reset();
                    return;
                }

                return response.json().then((data) => {
                    if (data && data.errors && data.errors.length > 0) {
                        showNotification(data.errors[0].message, 'error');
                    } else {
                        showNotification('Sorry, there was a problem sending your message.', 'error');
                    }
                });
            })
            .catch(() => {
                showNotification('Sorry, there was a problem sending your message.', 'error');
            });
    });
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach((item) => item.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 92px;
        right: 16px;
        z-index: 9999;
        background: ${type === 'success' ? '#0f0e13' : '#fff'};
        color: ${type === 'success' ? '#fff' : '#111'};
        border: 1px solid #111;
        border-radius: 999px;
        padding: 0.7rem 1rem;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        transform: translateX(120%);
        transition: transform 0.25s ease;
    `;

    document.body.appendChild(notification);
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    window.setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        window.setTimeout(() => notification.remove(), 240);
    }, 3200);
}

function openPriceEstimator(type) {
    const modal = document.getElementById('price-estimator-modal');
    const typeSelect = document.getElementById('estimator-type');

    if (!modal || !typeSelect) {
        return;
    }

    typeSelect.value = type;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateEstimate();
}

function closePriceEstimator() {
    const modal = document.getElementById('price-estimator-modal');
    const form = document.getElementById('price-estimator-form');

    if (!modal) {
        return;
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (form) {
        form.reset();
    }

    const typeSelect = document.getElementById('estimator-type');
    if (typeSelect) {
        typeSelect.value = 'web';
    }
}

function updateEstimate() {
    const type = document.getElementById('estimator-type').value;
    const timeline = parseFloat(document.getElementById('estimator-timeline').value);
    const checked = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');

    const basePrices = {
        web: 3000,
        mobile: 2000,
        design: 750,
        consulting: 150
    };

    const base = basePrices[type] || 3000;

    let featureCost = 0;
    checked.forEach((checkbox) => {
        featureCost += parseInt(checkbox.value, 10);
    });

    const total = (base + featureCost) * timeline;
    const min = Math.round(total * 0.8);
    const max = Math.round(total * 1.2);

    const output = document.getElementById('estimate-display');
    if (output) {
        output.textContent = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
}

function requestDetailedQuote() {
    const type = document.getElementById('estimator-type').value;
    const timeline = document.getElementById('estimator-timeline').value;
    const features = [];

    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach((checkbox) => {
        features.push(checkbox.parentElement.textContent.trim());
    });

    const projectTypeMap = {
        web: 'web-development',
        mobile: 'mobile-app',
        design: 'branding-design',
        consulting: 'it-consulting'
    };

    const timelineMap = {
        '1': 'Standard timeline (4-8 weeks)',
        '1.3': 'Expedited timeline (2-4 weeks)',
        '1.5': 'Rush timeline (1-2 weeks)'
    };

    const preFilledMessage = `Hi! I used your price estimator and I'm interested in:\n\nProject Type: ${type}\nTimeline: ${timelineMap[timeline]}\nFeatures Needed: ${features.join(', ')}\n\nI'd love to get a detailed quote.`;

    closePriceEstimator();

    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

    window.setTimeout(() => {
        document.getElementById('project-type').value = projectTypeMap[type] || 'web-development';
        document.getElementById('message').value = preFilledMessage;
    }, 500);
}

function togglePricingDetails(type) {
    const panel = document.getElementById(`pricing-details-${type}`);
    if (!panel) {
        return;
    }

    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

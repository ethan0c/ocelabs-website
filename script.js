document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    const landingArcMenu = initLandingArcMenu();

    initThemeToggle();
    initMobileMenu(navToggle, navMenu, navOverlay, navLinks);
    initSmoothAnchors();
    initActiveNav(navLinks);
    initNavAutoHide();
    initGsapAnimations();
    initMagneticButtons();
    initContactForm();

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu(navToggle, navMenu, navOverlay);
            landingArcMenu.close();
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
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const normalizedHref = href === '/' ? 'index.html' : href;
        link.classList.toggle('active', normalizedHref === currentPath);
    });
}

function initNavAutoHide() {
    const nav = document.getElementById('top-nav');
    const isLanding = document.body.classList.contains('landing-page');

    if (!nav || isLanding) {
        nav?.classList.remove('nav-hidden');
        return;
    }

    let lastY = window.scrollY;
    let ticking = false;

    const updateNavState = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;
        const isNearTop = currentY < 14;

        const isMobileMenuOpen = document.getElementById('nav-menu')?.classList.contains('active');
        const isArcMenuOpen = document.getElementById('scene-menu-toggle')?.getAttribute('aria-expanded') === 'true';
        const shouldKeepVisible = isMobileMenuOpen || isArcMenuOpen;

        if (isNearTop || shouldKeepVisible || delta < -5) {
            nav.classList.remove('nav-hidden');
        } else if (delta > 5 && currentY > 84) {
            nav.classList.add('nav-hidden');
        }

        lastY = currentY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavState);
            ticking = true;
        }
    }, { passive: true });
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

    const isLanding = document.body.classList.contains('landing-page');

    if (isLanding) {
        initLandingShowreel();
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.nav', { y: -20, opacity: 0, duration: 0.5, delay: isLanding ? 0.25 : 0 })
        .fromTo('.hero-eyebrow',
            { opacity: 0, filter: 'blur(6px)', y: 8 },
            { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5 },
        '-=0.15')
        .fromTo('.title-line',
            { opacity: 0, filter: 'blur(10px)', y: 18 },
            { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.07, duration: 0.62 },
        '-=0.2')
        .fromTo('.hero-subtitle',
            { opacity: 0, filter: 'blur(6px)', y: 10 },
            { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5 },
        '-=0.3')
        .from('.hero-buttons .btn', { y: 12, opacity: 0, stagger: 0.08, duration: 0.38 }, '-=0.2');

    if (isLanding) {
        heroTl
            .fromTo('.orbit-label',
                { opacity: 0, y: 6 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 },
            '-=0.4')
            .from('.shape', {
                opacity: 0,
                scale: 0.82,
                duration: 0.65,
                stagger: 0.06,
                ease: 'power2.out'
            }, '-=0.45');

        gsap.to('.shape--ring', {
            rotation: 360,
            transformOrigin: '50% 50%',
            duration: 14,
            ease: 'none',
            repeat: -1
        });

        gsap.to('.shape--cube', {
            rotationY: '+=360',
            rotationX: '+=360',
            duration: 10,
            ease: 'none',
            repeat: -1
        });

        gsap.to('.shape--cube', {
            y: -16,
            duration: 4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        gsap.to('.shape--diamond', {
            rotation: '+=360',
            duration: 13,
            ease: 'none',
            repeat: -1
        });

        gsap.to('.shape--diamond', {
            x: 18,
            duration: 5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        gsap.to('.shape--orb', {
            y: -24,
            scale: 1.16,
            duration: 6.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        gsap.to('.shape--grid', {
            rotationZ: 360,
            duration: 18,
            ease: 'none',
            repeat: -1
        });

        gsap.to('.orbit-label--tl, .orbit-label--br', {
            y: -10,
            opacity: 0.88,
            duration: 2.8,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });

        gsap.to('.orbit-label--tr, .orbit-label--bl', {
            y: 10,
            opacity: 0.65,
            duration: 3.2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });

        gsap.to('.hero-copy--center', {
            y: -8,
            duration: 4.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    } else {
        heroTl.from('.hero-rail .rail-card', { x: 24, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.35');
    }

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
        ...(isLanding ? { duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' } : {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.8
            }
        })
    });

    gsap.to('.glow-b', {
        yPercent: -18,
        xPercent: -8,
        ...(isLanding ? { duration: 7.5, yoyo: true, repeat: -1, ease: 'sine.inOut' } : {
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.9
            }
        })
    });
}

function initLandingShowreel() {
    const intro = document.querySelector('.landing-intro');

    if (intro) {
        const introTl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
        introTl
            .fromTo('.landing-intro-logo',
                { autoAlpha: 0, scale: 0.72, rotation: -18 },
                { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.75 }
            )
            .to('.landing-intro-line', { scaleX: 1, duration: 0.45 }, '-=0.35')
            .fromTo('.landing-intro-tag', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.38 }, '-=0.18')
            .to('.landing-intro', { autoAlpha: 0, duration: 0.52, delay: 0.22 })
            .set('.landing-intro', { display: 'none' });
    }

    gsap.from('.scene-menu-toggle--nav', {
        y: 14,
        opacity: 0,
        duration: 0.55,
        delay: 1.1,
        ease: 'power2.out'
    });

    initLandingTitleChoreography();
    initLandingCursorRig();
}

function initLandingArcMenu() {
    const toggle = document.getElementById('scene-menu-toggle');
    const panel = document.getElementById('scene-arc-panel');
    const openIcon = toggle ? toggle.querySelector('.menu-icon-open') : null;
    const closeIcon = toggle ? toggle.querySelector('.menu-icon-close') : null;

    if (!toggle || !panel || typeof gsap === 'undefined') {
        return { close: () => {} };
    }

    const links = gsap.utils.toArray('.scene-arc-link');
    if (!links.length) {
        return { close: () => {} };
    }

    let isOpen = false;

    gsap.set(panel, {
        autoAlpha: 0,
        scale: 0.9,
        y: -6,
        transformOrigin: '100% 0%',
        pointerEvents: 'none'
    });

    gsap.set(links, {
        autoAlpha: 0,
        y: -4,
        scale: 0.88
    });

    if (openIcon && closeIcon) {
        gsap.set(openIcon, { autoAlpha: 1, scale: 1, rotate: 0 });
        gsap.set(closeIcon, { autoAlpha: 0, scale: 0.74, rotate: -24 });
    }

    const menuTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onStart: () => {
            panel.style.pointerEvents = 'auto';
            panel.setAttribute('aria-hidden', 'false');
        },
        onReverseComplete: () => {
            panel.style.pointerEvents = 'none';
            panel.setAttribute('aria-hidden', 'true');
        }
    });

    menuTimeline
        .to(panel, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.26,
            ease: 'power2.out'
        })
        .to(links, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.055,
            duration: 0.2,
            ease: 'power2.out'
        }, '-=0.12');

    if (openIcon && closeIcon) {
        menuTimeline
            .to(openIcon, {
                autoAlpha: 0,
                scale: 0.74,
                rotate: 24,
                duration: 0.18
            }, '<')
            .to(closeIcon, {
                autoAlpha: 1,
                scale: 1,
                rotate: 0,
                duration: 0.18
            }, '<');
    }

    const resetToggleIcons = () => {
        if (!openIcon || !closeIcon) {
            return;
        }

        gsap.to(openIcon, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.16, overwrite: true });
        gsap.to(closeIcon, { autoAlpha: 0, scale: 0.74, rotate: -24, duration: 0.16, overwrite: true });
    };

    const setToggleIconsOpen = () => {
        if (!openIcon || !closeIcon) {
            return;
        }

        gsap.to(openIcon, { autoAlpha: 0, scale: 0.74, rotate: 24, duration: 0.16, overwrite: true });
        gsap.to(closeIcon, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.16, overwrite: true });
    };

    const close = () => {
        if (!isOpen) {
            return;
        }

        isOpen = false;
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        resetToggleIcons();
        menuTimeline.reverse();
    };

    const open = () => {
        if (isOpen) {
            return;
        }

        isOpen = true;
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        setToggleIconsOpen();
        menuTimeline.play(0);
    };

    toggle.addEventListener('click', () => {
        if (isOpen) {
            close();
            return;
        }

        open();
    });

    links.forEach((link) => {
        link.addEventListener('click', close);
    });

    document.addEventListener('click', (event) => {
        if (!isOpen) {
            return;
        }

        if (!panel.contains(event.target) && !toggle.contains(event.target)) {
            close();
        }
    });

    return { close };
}

function initLandingTitleChoreography() {
    const lines = gsap.utils.toArray('.hero-title .title-line');
    if (!lines.length) {
        return;
    }

    const titleSets = [
        ['BUILD BOLD', 'DIGITAL WORLDS', 'THAT MOVE.'],
        ['LAUNCH FASTER', 'LOOK SHARPER', 'SCALE CLEAN.'],
        ['CRAFT MOTION', 'SHIP PRODUCTS', 'OWN ATTENTION.'],
        ['CREATE IMPACT', 'DESIGN SYSTEMS', 'CODE FEARLESS.'],
    ];

    let currentSet = 0;

    gsap.delayedCall(15, function swapTitles() {
        currentSet = (currentSet + 1) % titleSets.length;

        gsap.timeline()
            .to(lines, {
                opacity: 0,
                filter: 'blur(8px)',
                y: -10,
                stagger: 0.035,
                duration: 0.22,
                ease: 'power2.in',
                onComplete: () => {
                    lines.forEach((line, index) => {
                        line.textContent = titleSets[currentSet][index];
                    });
                }
            })
            .fromTo(lines,
                { opacity: 0, filter: 'blur(8px)', y: 10 },
                {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    stagger: 0.05,
                    duration: 0.38,
                    ease: 'power3.out'
                }
            );

        gsap.delayedCall(15, swapTitles);
    });
}

function initLandingCursorRig() {
    const shapes = {
        ring: document.querySelector('.shape--ring'),
        cube: document.querySelector('.shape--cube'),
        diamond: document.querySelector('.shape--diamond'),
        orb: document.querySelector('.shape--orb'),
        grid: document.querySelector('.shape--grid'),
        copy: document.querySelector('.hero-copy--center'),
    };

    if (!shapes.ring || !window.matchMedia('(pointer: fine)').matches) {
        return;
    }

    window.addEventListener('mousemove', (event) => {
        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = (event.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(shapes.ring, { x: nx * 28, y: ny * 20, rotationY: nx * 22, rotationX: -ny * 16, duration: 0.8, ease: 'power3.out' });
        gsap.to(shapes.cube, { x: nx * -30, y: ny * -24, rotationY: nx * -46, rotationX: ny * 30, duration: 0.9, ease: 'power3.out' });
        gsap.to(shapes.diamond, { x: nx * 24, y: ny * -16, rotation: nx * 18, duration: 0.9, ease: 'power3.out' });
        gsap.to(shapes.orb, { x: nx * -18, y: ny * 16, scale: 1.08 + Math.abs(nx) * 0.06, duration: 0.85, ease: 'power3.out' });
        gsap.to(shapes.grid, { x: nx * 14, y: ny * 12, rotationX: 64 + ny * 8, rotationY: nx * 12, duration: 0.9, ease: 'power3.out' });
        gsap.to(shapes.copy, { x: nx * 9, y: ny * 7, duration: 0.9, ease: 'power3.out' });
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

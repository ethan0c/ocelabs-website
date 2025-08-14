
// Dynamically position the vertical line to start from the middle of the 'Start Your Project' button
// and end at the top of the "Let's Build Something" button in the work-cta section
function positionVerticalLine() {
    const startBtn = document.getElementById('start-project-btn');
    const endBtn = document.querySelector('.work-cta .btn-primary');
    const line = document.querySelector('.vertical-bg-line');
    if (startBtn && endBtn && line) {
        const startRect = startBtn.getBoundingClientRect();
        const endRect = endBtn.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        // Start from middle of startBtn
        const startY = startRect.top + scrollY + startRect.height / 2;
        // End at top of endBtn
        const endY = endRect.top + scrollY;
        line.style.top = startY + 'px';
        line.style.height = (endY - startY) + 'px';
    }
}

window.addEventListener('DOMContentLoaded', positionVerticalLine);
window.addEventListener('resize', positionVerticalLine);
window.addEventListener('scroll', positionVerticalLine);
// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking on overlay
    navOverlay.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize typing effect for hero subtitle
    initTypingEffect();
    
    // Initialize theme toggle
    initThemeToggle();
});

// Scroll Animation Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Add animation classes and observe elements
    const animateElements = document.querySelectorAll('.section-header, .service-card, .work-item, .contact-info, .contact-form');
    
    animateElements.forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        // Add stagger delay for multiple elements
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Typing Effect for Hero Subtitle
function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.opacity = '1';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 30);
        }
    }
    
    // Start typing effect after hero title animations
    setTimeout(typeWriter, 1200);
}

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    });
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const projectType = formData.get('project-type');
    const budget = formData.get('budget');
    const message = formData.get('message');

    // Basic validation (all fields required)
    if (!name || !email || !projectType || !budget || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    // AJAX submit to Formspree
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            form.reset();
        } else {
            return response.json().then(data => {
                if (data && data.errors && data.errors.length > 0) {
                    showNotification(data.errors[0].message, 'error');
                } else {
                    showNotification('Sorry, there was a problem sending your message.', 'error');
                }
            });
        }
    })
    .catch(() => {
        showNotification('Sorry, there was a problem sending your message.', 'error');
    });
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#000' : '#fff'};
        color: ${type === 'success' ? '#fff' : '#000'};
        border: 2px solid #000;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Scroll-based animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .work-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Navigation highlight on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// Add active state styles for navigation
const style = document.createElement('style');
style.textContent = `
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Preloader (optional)
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add subtle parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add hover effects for work links
document.querySelectorAll('.work-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');
        
        if (navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Form field focus animations
document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(field => {
    field.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    field.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});

// Price Estimator Functions
function openPriceEstimator(type) {
    const modal = document.getElementById('price-estimator-modal');
    const typeSelect = document.getElementById('estimator-type');
    
    // Set the project type
    typeSelect.value = type;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initial estimate calculation
    updateEstimate();
}

function closePriceEstimator() {
    const modal = document.getElementById('price-estimator-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset form
    document.getElementById('price-estimator-form').reset();
    document.getElementById('estimator-type').value = 'web';
}

function updateEstimate() {
    const type = document.getElementById('estimator-type').value;
    const timeline = parseFloat(document.getElementById('estimator-timeline').value);
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    
    // Base prices for each project type
    const basePrices = {
        web: 3000,
        mobile: 2000,
        design: 750,
        consulting: 150 // hourly rate * estimated hours
    };
    
    let basePrice = basePrices[type] || 3000;
    
    // Add feature costs
    let featureCost = 0;
    checkboxes.forEach(checkbox => {
        featureCost += parseInt(checkbox.value);
    });
    
    // Calculate total with timeline multiplier
    const total = (basePrice + featureCost) * timeline;
    const minPrice = Math.round(total * 0.8);
    const maxPrice = Math.round(total * 1.2);
    
    // Update display
    document.getElementById('estimate-display').textContent = 
        `$${minPrice.toLocaleString()} – $${maxPrice.toLocaleString()}`;
}

function requestDetailedQuote() {
    const type = document.getElementById('estimator-type').value;
    const timeline = document.getElementById('estimator-timeline').value;
    const features = [];
    
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        features.push(checkbox.nextSibling.textContent.trim());
    });
    
    // Prepare pre-filled contact form data
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
    
    const preFilledMessage = `Hi! I used your price estimator and I'm interested in:

Project Type: ${type.charAt(0).toUpperCase() + type.slice(1)}
Timeline: ${timelineMap[timeline]}
Features Needed: ${features.join(', ')}

I'd love to get a detailed quote for my project. Let's discuss!`;
    
    // Close modal
    closePriceEstimator();
    
    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill contact form
    setTimeout(() => {
        document.getElementById('project-type').value = projectTypeMap[type];
        document.getElementById('message').value = preFilledMessage;
    }, 500);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('price-estimator-modal');
    if (e.target === modal) {
        closePriceEstimator();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('price-estimator-modal');
        if (modal.style.display === 'block') {
            closePriceEstimator();
        }
    }
});

// Pricing Details Toggle
function togglePricingDetails(service) {
    const detailsElement = document.getElementById(`pricing-details-${service}`);
    const isVisible = detailsElement.style.display !== 'none';
    
    // Close all other pricing details first
    const allDetails = document.querySelectorAll('.pricing-details');
    allDetails.forEach(detail => {
        if (detail !== detailsElement) {
            detail.style.display = 'none';
        }
    });
    
    // Toggle current one
    detailsElement.style.display = isVisible ? 'none' : 'block';
}

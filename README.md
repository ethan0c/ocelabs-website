# Oce Labs Website

A bold and minimalist website for Oce Labs - Digital Innovation & Development.

## Features

- **Minimalist Design**: Clean black and white aesthetic
- **Responsive Layout**: Works perfectly on all devices
- **Contact Form**: Functional contact form for client inquiries
- **Services Showcase**: Professional presentation of services
- **Portfolio Section**: Links to art and development work
- **Smooth Animations**: Subtle scroll-based animations
- **Mobile Navigation**: Hamburger menu for mobile devices

## Structure

```
oce-labs-website/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Sections

1. **Hero Section**: Bold introduction with call-to-action buttons
2. **Services**: Four main service offerings
3. **Work**: Portfolio showcase with external links
4. **Contact**: Contact form and business information
5. **Footer**: Copyright and branding

## Customization

### Adding Your Links

In the **Work Section**, update these placeholder links:

```html
<!-- Digital Art Portfolio -->
<a href="#" class="work-link" target="_blank" rel="noopener">
  View Portfolio →
</a>
<a href="#" class="work-link" target="_blank" rel="noopener"> Instagram → </a>

<!-- Development Projects -->
<a href="#" class="work-link" target="_blank" rel="noopener"> GitHub → </a>
```

Replace the `#` with your actual URLs:

- Your art portfolio website
- Your Instagram profile
- Your GitHub profile

### Contact Information

Update the email address in the contact section:

```html
<a href="mailto:hello@ocelabs.tech">hello@ocelabs.tech</a>
```

### Services

Modify the services in the HTML to match your specific offerings.

## Deployment

1. **For ocelabs.tech domain:**

   - Upload all files to your web hosting provider
   - Ensure `index.html` is in the root directory
   - Point your domain to the hosting provider

2. **For testing locally:**
   - Open `index.html` in your web browser
   - Or use a local server for development

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Inter)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contact Form

The contact form currently shows a success message when submitted. To make it functional:

1. **Add backend processing** (PHP, Node.js, etc.)
2. **Use a service** like Formspree, Netlify Forms, or EmailJS
3. **Set up email forwarding** through your hosting provider

## License

© 2025 Oce Labs. All rights reserved.

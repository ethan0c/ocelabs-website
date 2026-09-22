import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <p>&copy; {new Date().getFullYear()} OCE Labs</p>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:hello@ocelabs.xyz">hello@ocelabs.xyz</a>
          {/* Internal estimator. Icon only, PIN-gated; rel=nofollow keeps it
              out of search alongside the page's own noindex. */}
          <Link
            href="/pricing"
            className="footer-internal"
            rel="nofollow"
            aria-label="Internal: pricing estimator"
            title="Estimator"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="5" y="10.5" width="14" height="10" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}

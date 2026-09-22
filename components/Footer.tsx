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
        </div>
      </div>
    </footer>
  );
}

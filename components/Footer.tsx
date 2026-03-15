import Link from 'next/link';
import { IoHeart } from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-left">
          <p>&copy; 2025 OCE LABS. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/work">Work</Link>
            <a href="mailto:contact@ocelabs.tech">Email</a>
            <a href="https://github.com/ethan0c" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
        <div className="footer-right">
          <p>Built with <IoHeart style={{ verticalAlign: 'middle' }} /> by OCE LABS</p>
          <p>Turning dreams into digital reality since 2024</p>
        </div>
      </div>
    </footer>
  );
}

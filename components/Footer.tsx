export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <p>&copy; {new Date().getFullYear()} OCE Labs</p>
        <div className="footer-links">
          <a href="mailto:contact@ocelabs.tech">contact@ocelabs.tech</a>
          <a href="https://github.com/ethan0c" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

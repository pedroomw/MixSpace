import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#gradient)" />
            <path d="M10 20L15 10L20 20L15 30L10 20Z" fill="white" opacity="0.9" />
            <path d="M20 20L25 10L30 20L25 30L20 20Z" fill="white" opacity="0.7" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className="logo-text">MixSpace</h1>
        </div>
        <p className="tagline">Upload your FL Studio projects to the cloud</p>
      </div>
    </header>
  );
}

export default Header;

import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        {/* Left: logo + tagline */}
        <div className="header-left">
          <div className="logo">
            <svg width="52" height="52" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="46" height="46" rx="10" fill="url(#logoGrad)" />
              <polygon points="14,23 19,15 24,23 19,31" fill="white" opacity="0.95" />
              <polygon points="22,23 27,15 32,23 27,31" fill="white" opacity="0.7" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="logo-text-group">
              <h1 className="logo-text">MixSpace</h1>
              <p className="tagline">Upload your FL Studio projects to the cloud</p>
            </div>
          </div>
        </div>

        {/* Right: profile only */}
        <div className="header-right">
          <div className="header-profile">
            <button className="icon-btn" aria-label="Ajustes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>

            <div className="avatar" aria-label="Perfil de usuario">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>

            <span className="username">Pedroomw</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

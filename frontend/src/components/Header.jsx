import { useState } from 'react';
import UserProfile from './UserProfile';
import logoImg from '../../imagenes/Logo mixspace fucsia.jfif';
import './Header.css';

function Header({ user, onLogout, onGoHome, onUserUpdate }) {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = (() => {
    if (user?.username) return user.username
    const email = user?.email || ''
    if (email.includes('@')) return email.split('@')[0]
    if (email) return email
    return 'Usuario'
  })()

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // TODO: implementar búsqueda de usuarios y proyectos públicos
    console.log('Buscar:', searchQuery);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">

          {/* Logo — click para volver al inicio */}
          <button className="header-logo" onClick={onGoHome} aria-label="Ir al inicio">
            <img src={logoImg} alt="MixSpace" className="header-logo-img" />
          </button>

          {/* Centro: buscador */}
          <form className="header-search-form" onSubmit={handleSearchSubmit} role="search">
            <div className="header-search-wrap">
              <svg className="header-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="header-search-input"
                type="search"
                placeholder="Buscar usuarios o proyectos…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar usuarios o proyectos"
              />
            </div>
          </form>

          {/* Derecha: perfil y logout */}
          <div className="header-right">
            <button
              className="header-profile"
              onClick={() => setShowProfile(true)}
              aria-label="Ver perfil"
              aria-expanded={showProfile}
            >
              <div className="header-avatar" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span className="header-username">{displayName}</span>
            </button>

            <button className="header-logout-btn" onClick={onLogout} aria-label="Cerrar sesión">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Panel de perfil */}
      {showProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
          onUserUpdate={(updatedUser) => {
            if (onUserUpdate) onUserUpdate(updatedUser);
          }}
        />
      )}
    </>
  );
}

export default Header;

import './HomeHero.css';

function HomeHero({ username, onCreateProject, projectCount = 0 }) {
  return (
    <div className="home-hero">

      {/* Brand logo */}
      <div className="home-hero-logo" aria-hidden="true">
        <svg width="64" height="46" viewBox="0 0 72 52" fill="none">
          <rect x="0"  y="18" width="8" height="16" rx="4" fill="#c084fc" opacity="0.75"/>
          <rect x="12" y="10" width="8" height="32" rx="4" fill="#c084fc" opacity="0.85"/>
          <rect x="24" y="2"  width="8" height="48" rx="4" fill="#c084fc"/>
          <rect x="36" y="12" width="8" height="28" rx="4" fill="#c084fc" opacity="0.85"/>
          <rect x="48" y="20" width="8" height="12" rx="4" fill="#c084fc" opacity="0.7"/>
          <rect x="60" y="14" width="8" height="24" rx="4" fill="#c084fc" opacity="0.8"/>
        </svg>
        <span className="home-hero-logo-text">MixSpace</span>
      </div>

      {/* Greeting */}
      <h1 className="home-hero-title">
        ¡Hola, <span className="home-hero-name">{username}</span>!
      </h1>

      <p className="home-hero-subtitle">
        Tu espacio para organizar proyectos musicales
      </p>

      <p className="home-hero-desc">
        Crea <span className="hero-tag">proyectos</span>, guarda{' '}
        <span className="hero-tag">versiones</span> de tus mezclas y llevá el
        control de tu <span className="hero-tag">progreso</span> sin salir de FL
        Studio.
      </p>

      {/* CTA */}
      <button className="home-hero-cta" onClick={onCreateProject}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Nuevo proyecto
      </button>

      {/* Feature cards */}
      <div className="home-hero-cards">
        <div className="hero-card">
          <div className="hero-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="hero-card-title">Proyectos</div>
            <div className="hero-card-desc">Organiza cada idea en su propio espacio</div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="hero-card-title">Versiones</div>
            <div className="hero-card-desc">Historial de cada mezcla, siempre accesible</div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="hero-card-title">Plugin FL Studio</div>
            <div className="hero-card-desc">Guardado directo desde tu DAW</div>
          </div>
        </div>
      </div>

      {/* Divider hint */}
      {projectCount > 0 && (
        <p className="home-hero-hint">
          Tenés <strong>{projectCount}</strong> {projectCount === 1 ? 'proyecto' : 'proyectos'} guardado{projectCount === 1 ? '' : 's'}. Seleccioná uno desde el panel derecho.
        </p>
      )}
      {projectCount === 0 && (
        <p className="home-hero-hint">
          Todavía no tenés proyectos. ¡Creá el primero con el botón de arriba!
        </p>
      )}

    </div>
  );
}

export default HomeHero;

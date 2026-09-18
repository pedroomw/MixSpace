import './HomeHero.css';

function HomeHero({ username, onCreateProject }) {
  return (
    <div className="home-hero">
      <div className="home-hero-waveform" aria-hidden="true">
        <svg width="72" height="52" viewBox="0 0 72 52" fill="none">
          <rect x="0"  y="18" width="8" height="16" rx="4" fill="#c084fc" opacity="0.9"/>
          <rect x="12" y="10" width="8" height="32" rx="4" fill="#c084fc" opacity="0.9"/>
          <rect x="24" y="2"  width="8" height="48" rx="4" fill="#c084fc" opacity="0.9"/>
          <rect x="36" y="12" width="8" height="28" rx="4" fill="#c084fc" opacity="0.9"/>
          <rect x="48" y="20" width="8" height="12" rx="4" fill="#c084fc" opacity="0.9"/>
          <rect x="60" y="14" width="8" height="24" rx="4" fill="#c084fc" opacity="0.9"/>
        </svg>
        <span className="home-hero-brand">MixSpace</span>
      </div>

      <h1 className="home-hero-title">
        ¡Hola, <span className="home-hero-name">{username}</span>!
      </h1>

      <h2 className="home-hero-subtitle">
        Organiza tus<br />proyectos musicales
      </h2>

      <p className="home-hero-desc">
        Crea <span className="hero-link">proyectos</span>, guarda{' '}
        <span className="hero-link">versiones</span> y lleva el control de tu{' '}
        <span className="hero-link">progreso</span> sin salir de FL Studio.
      </p>

      <button className="home-hero-cta" onClick={onCreateProject}>
        Crear proyecto
      </button>
    </div>
  );
}

export default HomeHero;

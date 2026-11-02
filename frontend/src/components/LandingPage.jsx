import logoImg from '../../imagenes/Logo mixspace fucsia.jfif'
import './LandingPage.css'

/**
 * LandingPage — página pública que se muestra cuando no hay sesión activa.
 *
 * Props:
 *   onLogin()     — abre el formulario de inicio de sesión
 *   onRegister()  — abre el formulario de registro
 *   isPlugin      — true cuando se abre desde el plugin de FL Studio
 *                   (oculta la sección de descarga)
 */
function LandingPage({ onLogin, onRegister, isPlugin = false }) {
    return (
        <div className="landing">

            {/* ── Header público ─────────────────────────────────────────── */}
            <header className="landing-header">
                <div className="landing-header-content">
                    <div className="landing-header-logo">
                        <img src={logoImg} alt="MixSpace" className="landing-header-logo-img" />
                    </div>
                    <nav className="landing-header-nav" aria-label="Navegación principal">
                        {!isPlugin && (
                            <a href="#download" className="landing-nav-link">Descargar</a>
                        )}
                        <a href="#features" className="landing-nav-link">Características</a>
                        <button className="landing-btn-ghost" onClick={onLogin}>
                            Iniciar sesión
                        </button>
                        <button className="landing-btn-primary" onClick={onRegister}>
                            Empezar gratis
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="landing-hero" aria-label="Presentación">

                <div className="landing-hero-logo" aria-hidden="true">
                    <img src={logoImg} alt="" className="landing-hero-logo-img" />
                </div>

                <h1 className="landing-hero-title">
                    Tu espacio para{' '}
                    <span className="landing-accent">organizar</span>
                    <br />
                    proyectos musicales
                </h1>

                <p className="landing-hero-subtitle">
                    Guardá versiones de tus mezclas, organizalas por proyecto
                    y accedé a tu historial directamente desde FL Studio.
                </p>

                <div className="landing-hero-cta-row">
                    <button className="landing-btn-primary landing-btn-lg" onClick={onRegister}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Crear cuenta gratis
                    </button>
                    <button className="landing-btn-ghost landing-btn-lg" onClick={onLogin}>
                        Ya tengo cuenta
                    </button>
                </div>

                {/* Badges de info */}
                <div className="landing-badges">
                    <span className="landing-badge">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Gratis
                    </span>
                    <span className="landing-badge">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Compatible con FL Studio
                    </span>
                    <span className="landing-badge">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Historial ilimitado
                    </span>
                </div>
            </section>

            {/* ── Descarga del plugin — solo visible en la web ───────────── */}
            {!isPlugin && (
                <section className="landing-download" id="download" aria-labelledby="download-title">
                    <div className="landing-section-inner">
                        <div className="landing-download-cards">
                            <div className="landing-download-card">
                                <div className="landing-download-card-icon" aria-hidden="true">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                                        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <div className="landing-download-card-body">
                                    <h3 className="landing-download-card-title">Instalador Windows</h3>
                                    <p className="landing-download-card-desc">
                                        Instalador completo para Windows 10/11. Incluye la interfaz de escritorio.
                                    </p>
                                    <span className="landing-download-tag">.exe · Windows 10/11</span>
                                </div>
                                <button className="landing-download-btn" disabled aria-label="Próximamente disponible">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                    </svg>
                                    Próximamente
                                </button>
                            </div>

                            <div className="landing-download-card">
                                <div className="landing-download-card-icon" aria-hidden="true">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
                                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="landing-download-card-body">
                                    <h3 className="landing-download-card-title">Plugin VST3</h3>
                                    <p className="landing-download-card-desc">
                                        Plugin VST3 para usar directamente en FL Studio o cualquier DAW compatible.
                                    </p>
                                    <span className="landing-download-tag">.vst3 · FL Studio / DAW</span>
                                </div>
                                <button className="landing-download-btn" disabled aria-label="Próximamente disponible">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                    </svg>
                                    Próximamente
                                </button>
                            </div>
                        </div>

                        <p className="landing-download-note">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Ambas descargas estarán disponibles en el lanzamiento oficial de MixSpace.
                        </p>
                    </div>
                </section>
            )}

            {/* ── Features ───────────────────────────────────────────────── */}
            <section className="landing-features" id="features" aria-labelledby="features-title">
                <div className="landing-section-inner">
                    <p className="landing-section-eyebrow">Características</p>
                    <h2 className="landing-section-title" id="features-title">
                        Todo lo que necesitás para tu flujo creativo
                    </h2>
                    <p className="landing-section-subtitle">
                        Diseñado por productores, para productores.
                    </p>

                    <div className="landing-feature-grid">
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3 className="landing-feature-title">Proyectos organizados</h3>
                            <p className="landing-feature-desc">
                                Creá proyectos separados para cada canción, EP o álbum. Mantené todo en orden sin mezclar archivos.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3 className="landing-feature-title">Historial de versiones</h3>
                            <p className="landing-feature-desc">
                                Cada mezcla guardada queda registrada con fecha y descripción. Volvé a cualquier versión anterior cuando quieras.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="landing-feature-title">Plugin para FL Studio</h3>
                            <p className="landing-feature-desc">
                                Guardá versiones directamente desde tu DAW sin salir de FL Studio. Un clic y tu progreso queda en la nube.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="landing-feature-title">Tags y metadatos</h3>
                            <p className="landing-feature-desc">
                                Etiquetá tus versiones para encontrarlas fácil. Filtrá por género, estado de producción o lo que necesites.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="landing-feature-title">Descarga en cualquier momento</h3>
                            <p className="landing-feature-desc">
                                Accedé a tus archivos desde cualquier dispositivo y descargalos cuando los necesites.
                            </p>
                        </div>

                        <div className="landing-feature-card landing-feature-card--soon">
                            <div className="landing-feature-icon" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="landing-feature-soon-badge">Próximamente</div>
                            <h3 className="landing-feature-title">Proyectos públicos</h3>
                            <p className="landing-feature-desc">
                                Compartí tu proceso creativo con la comunidad. Explorá proyectos de otros productores y conectá con ellos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA final ──────────────────────────────────────────────── */}
            <section className="landing-cta-section" aria-label="Llamada a la acción">
                <div className="landing-section-inner landing-cta-inner">
                    <h2 className="landing-cta-title">
                        Empezá a organizar tu música hoy
                    </h2>
                    <p className="landing-cta-subtitle">
                        Creá tu cuenta gratis y empezá a guardar versiones en segundos.
                    </p>
                    <button className="landing-btn-primary landing-btn-lg" onClick={onRegister}>
                        Crear cuenta gratis
                    </button>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <img src={logoImg} alt="MixSpace" className="landing-footer-logo" />
                    <span className="landing-footer-copy">
                        By Pods and Peps. &nbsp; All credits reserved to MixSpace Co.
                    </span>
                </div>
            </footer>

        </div>
    )
}

export default LandingPage

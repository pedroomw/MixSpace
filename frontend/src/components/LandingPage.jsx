import logoImg from '../../imagenes/Logo mixspace fucsia.jfif'
import './LandingPage.css'

/**
 * LandingPage — página pública que se muestra cuando no hay sesión activa.
 *
 * Props:
 *   onLogin()     — abre el formulario de inicio de sesión
 *   onRegister()  — abre el formulario de registro
 */
function LandingPage({ onLogin, onRegister }) {
    return (
        <div className="landing">
            {/* ── Header público ──────────────────────────────────────────── */}
            <header className="landing-header">
                <div className="landing-header-content">
                    <div className="landing-header-logo">
                        <img src={logoImg} alt="MixSpace" className="landing-header-logo-img" />
                    </div>
                    <nav className="landing-header-nav" aria-label="Acceso a la cuenta">
                        <button
                            className="landing-btn-ghost"
                            onClick={onLogin}
                            aria-label="Iniciar sesión"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            className="landing-btn-primary"
                            onClick={onRegister}
                            aria-label="Crear cuenta gratis"
                        >
                            Empezar gratis
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <main className="landing-hero">
                <div className="landing-hero-logo" aria-hidden="true">
                    <img src={logoImg} alt="" className="landing-hero-logo-img" />
                </div>

                <h1 className="landing-hero-title">
                    Tu espacio para{' '}
                    <span className="landing-accent">organizar</span> proyectos musicales
                </h1>

                <p className="landing-hero-subtitle">
                    Guardá versiones de tus mezclas, organizalas por proyecto y accedé
                    a tu historial directamente desde FL Studio.
                </p>

                <div className="landing-hero-cta-row">
                    <button className="landing-btn-primary landing-btn-lg" onClick={onRegister}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Crear cuenta gratis
                    </button>
                    <button className="landing-btn-ghost" onClick={onLogin}>
                        Ya tengo cuenta
                    </button>
                </div>

                {/* ── Feature cards ──────────────────────────────────────── */}
                <div className="landing-cards">
                    <div className="landing-card">
                        <div className="landing-card-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <div className="landing-card-title">Proyectos</div>
                            <div className="landing-card-desc">Organiza cada idea en su propio espacio</div>
                        </div>
                    </div>

                    <div className="landing-card">
                        <div className="landing-card-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <div className="landing-card-title">Versiones</div>
                            <div className="landing-card-desc">Historial de cada mezcla, siempre accesible</div>
                        </div>
                    </div>

                    <div className="landing-card">
                        <div className="landing-card-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <div className="landing-card-title">Plugin FL Studio</div>
                            <div className="landing-card-desc">Guardado directo desde tu DAW</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="landing-footer">
                <span>By Pods and Peps. &nbsp; All credits reserved to MixSpace Co.</span>
            </footer>
        </div>
    )
}

export default LandingPage

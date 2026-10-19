import { useState, useEffect } from 'react';
import { getMe } from '../services/apiClient';
import './UserProfile.css';

/**
 * UserProfile
 * Carga el perfil del usuario desde GET /auth/me al abrirse,
 * y muestra email, fecha de creación e ID.
 *
 * Props:
 *   user     - objeto inicial del localStorage (fallback mientras carga)
 *   onClose  - callback para cerrar/ocultar el panel
 */
function UserProfile({ user, onClose }) {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMe().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setProfile(result.user);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // Usa los datos del servidor si están disponibles, si no usa los del localStorage
  const email     = profile?.email      ?? user?.email      ?? '—';
  const userId    = profile?.id         ?? user?.id         ?? user?.sub ?? '—';
  const createdAt = profile?.created_at ?? user?.created_at ?? null;

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-AR', {
      day:   '2-digit',
      month: 'long',
      year:  'numeric',
    });
  };

  return (
    <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-panel" role="dialog" aria-label="Perfil de usuario" aria-modal="true">

        {/* Header del panel */}
        <div className="profile-header">
          <div className="profile-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            Perfil
          </div>
          <button className="profile-close-btn" onClick={onClose} aria-label="Cerrar perfil">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Avatar decorativo */}
        <div className="profile-avatar-wrap" aria-hidden="true">
          <div className="profile-avatar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        </div>

        {/* Datos del usuario */}
        <div className="profile-fields">

          {/* Error al cargar */}
          {error && !loading && (
            <p className="profile-error">{error}</p>
          )}

          {/* Email — dato principal */}
          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">
              {loading ? <span className="profile-skeleton" /> : email}
            </span>
          </div>

          {/* Fecha de creación */}
          <div className="profile-field">
            <span className="profile-field-label">Miembro desde</span>
            <span className="profile-field-value">
              {loading ? <span className="profile-skeleton" /> : formatDate(createdAt)}
            </span>
          </div>

          {/* ID de usuario — detalle menor */}
          <div className="profile-field profile-field--minor">
            <span className="profile-field-label">ID de usuario</span>
            <span className="profile-field-value profile-field-value--mono" title={userId}>
              {loading ? <span className="profile-skeleton" /> : userId}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;

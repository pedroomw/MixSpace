import { useState, useEffect } from 'react';
import { getMe, updateMe } from '../services/apiClient';
import { setUser as storeUser } from '../services/tokenStore';
import './UserProfile.css';

/**
 * UserProfile
 * Carga el perfil del usuario desde GET /auth/me al abrirse.
 * Permite editar el nombre de usuario (username) y la contraseña.
 *
 * Props:
 *   user        - objeto del usuario en App (para fallback y actualización)
 *   onClose     - callback para cerrar el panel
 *   onUserUpdate(updatedUser) - callback para que App.jsx actualice su estado
 */
function UserProfile({ user, onClose, onUserUpdate }) {
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);

  // Formulario de edición
  const [editing,       setEditing]       = useState(false);
  const [newUsername,   setNewUsername]   = useState('');
  const [newPassword,   setNewPassword]   = useState('');
  const [confirmPass,   setConfirmPass]   = useState('');
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState(null);
  const [saveSuccess,   setSaveSuccess]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMe().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setProfile(result.user);
        setNewUsername(result.user.username || '');
      } else {
        setError(result.error);
        setNewUsername(user?.username || '');
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // Datos combinados: servidor > localStorage
  const email     = profile?.email      ?? user?.email      ?? '—';
  const userId    = profile?.id         ?? user?.id         ?? user?.sub ?? '—';
  const username  = profile?.username   ?? user?.username   ?? '—';
  const country   = profile?.country    ?? user?.country    ?? '—';
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

  const handleStartEdit = () => {
    setSaveError(null);
    setSaveSuccess(false);
    setNewPassword('');
    setConfirmPass('');
    setNewUsername(profile?.username ?? user?.username ?? '');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
    setNewPassword('');
    setConfirmPass('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    // Validaciones
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      setSaveError('El nombre de usuario no puede estar vacío');
      return;
    }
    if (newPassword || confirmPass) {
      if (newPassword !== confirmPass) {
        setSaveError('Las contraseñas no coinciden');
        return;
      }
      if (newPassword.length < 6) {
        setSaveError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    const updates = {};
    if (trimmedUsername !== (profile?.username ?? '')) updates.username = trimmedUsername;
    if (newPassword) updates.newPassword = newPassword;

    if (Object.keys(updates).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    const result = await updateMe(updates);
    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    // Actualizar perfil local con los datos devueltos por el servidor
    setProfile(result.user);
    setSaveSuccess(true);
    setEditing(false);
    setNewPassword('');
    setConfirmPass('');

    // Propagar al estado global (App.jsx y localStorage)
    const enriched = { ...(user || {}), ...result.user };
    storeUser(enriched);
    if (onUserUpdate) onUserUpdate(enriched);
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
          {/* Nombre de usuario debajo del avatar */}
          {!loading && (
            <p className="profile-avatar-name">
              {username !== '—' ? username : email}
            </p>
          )}
        </div>

        {/* Datos del usuario */}
        <div className="profile-fields">

          {error && !loading && (
            <p className="profile-error">{error}</p>
          )}

          {saveSuccess && (
            <p className="profile-success">Perfil actualizado correctamente</p>
          )}

          {/* Nombre de usuario */}
          <div className="profile-field">
            <span className="profile-field-label">Nombre de usuario</span>
            <span className="profile-field-value">
              {loading ? <span className="profile-skeleton" /> : username}
            </span>
          </div>

          {/* Email */}
          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <span className="profile-field-value">
              {loading ? <span className="profile-skeleton" /> : email}
            </span>
          </div>

          {/* País */}
          {(country !== '—' || !loading) && (
            <div className="profile-field">
              <span className="profile-field-label">País</span>
              <span className="profile-field-value">
                {loading ? <span className="profile-skeleton" /> : country}
              </span>
            </div>
          )}

          {/* Fecha de creación */}
          <div className="profile-field">
            <span className="profile-field-label">Miembro desde</span>
            <span className="profile-field-value">
              {loading ? <span className="profile-skeleton" /> : formatDate(createdAt)}
            </span>
          </div>

          {/* ID de usuario */}
          <div className="profile-field profile-field--minor">
            <span className="profile-field-label">ID de usuario</span>
            <span className="profile-field-value profile-field-value--mono" title={userId}>
              {loading ? <span className="profile-skeleton" /> : userId}
            </span>
          </div>

        </div>

        {/* Botón de editar / formulario de edición */}
        {!loading && !editing && (
          <div className="profile-actions">
            <button className="profile-edit-btn" onClick={handleStartEdit}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar perfil
            </button>
          </div>
        )}

        {editing && (
          <form className="profile-edit-form" onSubmit={handleSave} noValidate>
            <p className="profile-edit-title">Editar perfil</p>

            <label className="profile-edit-label" htmlFor="edit-username">
              Nombre de usuario
            </label>
            <input
              id="edit-username"
              className="profile-edit-input"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nombre de usuario"
              autoComplete="username"
              required
            />

            <label className="profile-edit-label" htmlFor="edit-password">
              Nueva contraseña <span className="profile-edit-optional">(opcional)</span>
            </label>
            <input
              id="edit-password"
              className="profile-edit-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
            />

            <label className="profile-edit-label" htmlFor="edit-confirm-pass">
              Confirmar contraseña
            </label>
            <input
              id="edit-confirm-pass"
              className="profile-edit-input"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
            />

            {saveError && (
              <p className="profile-error" role="alert">{saveError}</p>
            )}

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-edit-cancel-btn"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="profile-edit-save-btn"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default UserProfile;

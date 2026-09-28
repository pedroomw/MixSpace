import { useState, useEffect, useRef } from 'react';
import './CreateProjectModal.css';

/**
 * CreateProjectModal
 *
 * Props:
 *   open        – boolean, controls visibility
 *   onClose()   – called when the user cancels or closes
 *   onSubmit({ name, description }) – called with the form values; should return
 *                 { ok, error? } (the actual API call lives in the parent)
 *   loading     – boolean, disables the form while the request is in flight
 *   error       – string | null, server error to display inside the modal
 */
function CreateProjectModal({ open, onClose, onSubmit, loading = false, error = null }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError]     = useState('');

  const nameRef = useRef(null);

  // Focus the name field every time the modal opens
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setNameError('');
      // Small delay so the CSS transition finishes before focusing
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, loading, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('El nombre es obligatorio');
      nameRef.current?.focus();
      return;
    }
    setNameError('');
    onSubmit({ name: trimmed, description: description.trim() });
  };

  if (!open) return null;

  return (
    <div
      className="cpm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cpm-title"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="cpm-panel">
        {/* Header */}
        <div className="cpm-header">
          <h2 id="cpm-title" className="cpm-title">Nuevo proyecto</h2>
          <button
            type="button"
            className="cpm-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form className="cpm-form" onSubmit={handleSubmit} noValidate>
          <div className="cpm-field">
            <label htmlFor="cpm-name" className="cpm-label">
              Nombre <span className="cpm-required">*</span>
            </label>
            <input
              ref={nameRef}
              id="cpm-name"
              type="text"
              className={`cpm-input${nameError ? ' cpm-input--error' : ''}`}
              placeholder="Mi proyecto de música"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              disabled={loading}
              maxLength={100}
              autoComplete="off"
            />
            {nameError && (
              <span className="cpm-field-error" role="alert">{nameError}</span>
            )}
          </div>

          <div className="cpm-field">
            <label htmlFor="cpm-desc" className="cpm-label">
              Descripción <span className="cpm-optional">(opcional)</span>
            </label>
            <textarea
              id="cpm-desc"
              className="cpm-textarea"
              placeholder="Descripción del proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={300}
            />
          </div>

          {/* Server-side error */}
          {error && (
            <div className="cpm-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="cpm-actions">
            <button
              type="button"
              className="cpm-btn cpm-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="cpm-btn cpm-btn--primary"
              disabled={loading}
            >
              {loading
                ? <><span className="cpm-spinner" aria-hidden="true" /> Creando…</>
                : 'Crear proyecto'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;

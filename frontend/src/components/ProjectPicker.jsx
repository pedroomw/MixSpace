import { useState, useEffect, useRef } from 'react';
import { getProjects } from '../services/apiClient';
import './ProjectPicker.css';

/**
 * ProjectPicker
 * Shows a button labelled "Mis proyectos". On click it opens a popup that
 * fetches the user's projects and lets them pick one.
 *
 * Props:
 *   selectedProject  – { id, name } | null
 *   onSelect(project) – called with the chosen project object
 *   disabled          – mirrors the uploading state of the parent form
 *   required          – shows the required asterisk
 */
function ProjectPicker({ selectedProject, onSelect, disabled = false, required = false }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popupRef = useRef(null);
  const triggerRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    const result = await getProjects();
    setLoading(false);

    if (result.ok) {
      setProjects(result.projects);
    } else {
      setError(result.error || 'Error al cargar los proyectos');
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    if (next) fetchProjects();
  };

  const handleSelect = (project) => {
    onSelect(project);
    setOpen(false);
  };

  return (
    <div className="project-picker">
      <label className="project-picker-label">
        Proyecto
        {required && <span className="required-mark"> *</span>}
      </label>

      <div className="project-picker-control">
        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          className={`project-picker-trigger${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="project-picker-trigger-icon">
            {/* Folder icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h3.586a1 1 0 01.707.293L9.707 4.707A1 1 0 0010.414 5H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
          </span>

          <span className="project-picker-trigger-text">
            {selectedProject ? selectedProject.name : 'Mis proyectos'}
          </span>

          <span className={`project-picker-chevron${open ? ' rotated' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {/* Selected project badge */}
        {selectedProject && (
          <div className="project-picker-selected">
            <span className="project-picker-selected-id">ID: {selectedProject.id}</span>
            <button
              type="button"
              className="project-picker-clear"
              onClick={() => onSelect(null)}
              disabled={disabled}
              aria-label="Quitar proyecto seleccionado"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Popup */}
      {open && (
        <div
          ref={popupRef}
          className="project-picker-popup"
          role="listbox"
          aria-label="Seleccionar proyecto"
        >
          <div className="project-picker-popup-header">
            <span>Mis proyectos</span>
            <button
              type="button"
              className="project-picker-popup-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="project-picker-popup-body">
            {loading && (
              <div className="project-picker-state">
                <span className="project-picker-spinner" aria-hidden="true" />
                Cargando proyectos...
              </div>
            )}

            {!loading && error && (
              <div className="project-picker-state error">
                <span>⚠️ {error}</span>
                <button type="button" className="project-picker-retry" onClick={fetchProjects}>
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="project-picker-state">
                No tenés proyectos aún.
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <ul className="project-picker-list">
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedProject?.id === p.id}
                      className={`project-picker-item${selectedProject?.id === p.id ? ' selected' : ''}`}
                      onClick={() => handleSelect(p)}
                    >
                      <div className="project-picker-item-name">{p.name}</div>
                      {p.description && (
                        <div className="project-picker-item-meta">{p.description}</div>
                      )}
                      <div className="project-picker-item-id">ID: {p.id}</div>
                      {selectedProject?.id === p.id && (
                        <span className="project-picker-item-check" aria-hidden="true">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectPicker;

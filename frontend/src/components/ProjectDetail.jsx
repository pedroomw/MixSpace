import { useState, useEffect, useRef } from 'react';
import { uploadFile } from '../services/apiClient';
import './ProjectDetail.css';

const API_BASE = 'http://localhost:3000';

async function fetchVersions(projectId) {
  const token = localStorage.getItem('mixspace_token');
  const res = await fetch(`${API_BASE}/versions/project/${projectId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Upload drawer ────────────────────────────────────────────────────────────
function UploadDrawer({ projectId, onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setErrorMsg('Seleccioná un archivo .flp'); return; }
    if (!description.trim()) { setErrorMsg('La descripción es obligatoria'); return; }

    setStatus('uploading');
    setErrorMsg('');

    const result = await uploadFile({ file, description: description.trim(), project_id: projectId });

    if (result.ok) {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Error al subir');
    }
  };

  return (
    <div className="upload-drawer">
      <div className="upload-drawer-header">
        <span>Subir versión</span>
        <button className="drawer-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <form className="upload-drawer-form" onSubmit={handleSubmit}>
        {/* File row */}
        <div className="drawer-field">
          <input
            ref={fileInputRef}
            id="drawer-file"
            type="file"
            accept=".flp"
            className="hidden-input"
            disabled={status === 'uploading'}
            onChange={(e) => { setFile(e.target.files?.[0] || null); setErrorMsg(''); }}
          />
          <label htmlFor="drawer-file" className={`drawer-file-btn${status === 'uploading' ? ' disabled' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h3.586a1 1 0 01.707.293L9.707 4.707A1 1 0 0010.414 5H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
            {file ? file.name.length > 28 ? file.name.slice(0, 26) + '…' : file.name : 'Elegir .flp'}
          </label>
        </div>

        {/* Description */}
        <div className="drawer-field">
          <input
            type="text"
            placeholder="Descripción de la versión…"
            className="drawer-input"
            value={description}
            maxLength={200}
            disabled={status === 'uploading'}
            onChange={(e) => { setDescription(e.target.value); setErrorMsg(''); }}
          />
        </div>

        {errorMsg && <p className="drawer-error">{errorMsg}</p>}

        <button
          type="submit"
          className={`drawer-submit-btn${status === 'uploading' ? ' loading' : ''}${status === 'success' ? ' success' : ''}`}
          disabled={status === 'uploading' || status === 'success'}
        >
          {status === 'uploading' && <span className="btn-spinner" />}
          {status === 'success' ? '✓ Subido' : status === 'uploading' ? 'Subiendo…' : 'Subir'}
        </button>
      </form>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ProjectDetail({ project }) {
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const loadVersions = async () => {
    setLoadingVersions(true);
    setVersionsError('');
    try {
      const data = await fetchVersions(project.id);
      setVersions(Array.isArray(data) ? data : []);
    } catch (err) {
      setVersionsError('No se pudieron cargar las versiones');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Reload versions whenever the selected project changes
  useEffect(() => {
    setVersions([]);
    setShowUpload(false);
    setShowVersions(false);
    loadVersions();
  }, [project.id]);

  const handleToggleVersions = () => {
    setShowVersions((v) => !v);
  };

  const latestVersion = versions[0];

  return (
    <div className="project-detail">
      {/* ── Header ── */}
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 className="detail-title">{project.name}</h2>
        </div>
        {project.description && (
          <p className="detail-meta">{project.description}</p>
        )}
        {!project.description && latestVersion && (
          <p className="detail-meta">{latestVersion.description}</p>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="detail-actions">
        <button
          className="detail-btn primary"
          onClick={() => { setShowUpload((v) => !v); }}
        >
          <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Subir Versión
        </button>

        <button
          className={`detail-btn secondary${showVersions ? ' active' : ''}`}
          onClick={handleToggleVersions}
        >
          <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          Cambios
          {versions.length > 0 && (
            <span className="detail-badge">{versions.length}</span>
          )}
        </button>
      </div>

      {/* ── Upload drawer ── */}
      {showUpload && (
        <UploadDrawer
          projectId={project.id}
          onSuccess={loadVersions}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* ── Versions list ── */}
      {showVersions && (
        <div className="versions-section">
          <div className="versions-header">
            <span className="versions-label">
              Cambios · {loadingVersions ? '…' : versions.length} versiones
            </span>
          </div>

          {loadingVersions && (
            <div className="versions-loading">
              <span className="btn-spinner accent" />
              Cargando…
            </div>
          )}

          {!loadingVersions && versionsError && (
            <p className="versions-error">{versionsError}</p>
          )}

          {!loadingVersions && !versionsError && versions.length === 0 && (
            <p className="versions-empty">Sin versiones todavía.</p>
          )}

          {!loadingVersions && versions.length > 0 && (
            <ul className="versions-list">
              {versions.map((v) => (
                <li key={v.id ?? v.filename} className="version-item">
                  <div className="version-item-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                    </svg>
                  </div>
                  <div className="version-item-info">
                    <span className="version-item-name">{v.description || v.filename}</span>
                    <span className="version-item-meta">
                      {formatDate(v.created_at)}
                      {v.size ? ` · ${formatBytes(v.size)}` : ''}
                    </span>
                  </div>
                  <div className="version-item-actions">
                    <a
                      className="version-download-btn"
                      href={`${API_BASE}/versions/download/${v.id ?? v.filename}`}
                      aria-label="Descargar versión"
                      title="Descargar"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Open last version button ── */}
      {latestVersion && (
        <div className="detail-footer">
          <a
            className="open-last-btn"
            href={`${API_BASE}/versions/download/${latestVersion.id ?? latestVersion.filename}`}
          >
            Abrir última versión
          </a>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;

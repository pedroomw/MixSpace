import { useState, useEffect, useRef } from 'react';
import { uploadFile, downloadVersion } from '../services/apiClient';
import axios from 'axios';
import './ProjectDetail.css';

const API_BASE = 'http://localhost:3000';

async function fetchVersions(projectId) {
  const token = localStorage.getItem('mixspace_token');
  try {
    const response = await axios.get(`${API_BASE}/versions/project/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    const status = err.response?.status;
    const msg    = err.response?.data?.error || err.message || 'Error desconocido';
    throw new Error(`HTTP ${status ?? 'red'}: ${msg}`);
  }
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

// ─── Decorative waveform ──────────────────────────────────────────────────────
function WaveformDecor() {
  const bars = [
    [0,28,8],[14,20,24],[28,10,44],[42,16,32],[56,4,56],
    [70,14,36],[84,22,20],[98,8,48],[112,18,28],[126,6,52],
    [140,24,16],[154,12,40],[168,2,60],[182,16,32],[196,26,12],
    [210,10,44],[224,20,24],[238,8,48],[252,18,28],[266,28,8],
    [280,14,36],[294,22,20],[308,10,44],
  ];
  return (
    <svg className="project-decor-wave" viewBox="0 0 320 64" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {bars.map(([x, y, h], i) => (
        <rect key={i} x={x} y={y} width="8" height={h} rx="4"
          fill="#c084fc" opacity={0.10 + (i % 5) * 0.035} />
      ))}
    </svg>
  );
}

// ─── Upload modal ─────────────────────────────────────────────────────────────
function UploadModal({ projectId, onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle');
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
      setTimeout(() => { onSuccess(); onClose(); }, 1100);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Error al subir');
    }
  };

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal">
        <div className="upload-modal-header">
          <div className="upload-modal-title">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
            Subir versión
          </div>
          <button className="upload-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <form className="upload-modal-form" onSubmit={handleSubmit}>
          <input ref={fileInputRef} id="modal-file" type="file" accept=".flp"
            className="hidden-input" disabled={status === 'uploading'}
            onChange={(e) => { setFile(e.target.files?.[0] || null); setErrorMsg(''); }} />

          <label htmlFor="modal-file" className={`modal-file-zone${file ? ' has-file' : ''}${status === 'uploading' ? ' disabled' : ''}`}>
            {file ? (
              <>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{color:'var(--accent-primary)'}}>
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
                <span className="modal-file-name">{file.name.length > 32 ? file.name.slice(0,30)+'…' : file.name}</span>
                <span className="modal-file-change">Cambiar archivo</span>
              </>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--text-muted)'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
                </svg>
                <span className="modal-file-label">Elegí un archivo <strong>.flp</strong></span>
              </>
            )}
          </label>

          <input type="text" placeholder="Descripción de la versión…" className="modal-input"
            value={description} maxLength={200} disabled={status === 'uploading'}
            onChange={(e) => { setDescription(e.target.value); setErrorMsg(''); }} />

          {errorMsg && <p className="modal-error">{errorMsg}</p>}

          <button type="submit"
            className={`modal-submit-btn${status === 'uploading' ? ' loading' : ''}${status === 'success' ? ' success' : ''}`}
            disabled={status === 'uploading' || status === 'success'}>
            {status === 'uploading' && <span className="btn-spinner" />}
            {status === 'success' ? '✓ Subido' : status === 'uploading' ? 'Subiendo…' : 'Subir versión'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ProjectDetail({ project, onGoHome, onCreateProject }) {
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
      setVersions(data);
    } catch (err) {
      setVersionsError(`No se pudieron cargar las versiones (${err.message})`);
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    setVersions([]);
    setShowUpload(false);
    setShowVersions(false);
    loadVersions();
  }, [project.id]);

  const latestVersion = versions[0];

  return (
    <div className="project-detail">

      {/* ── Top nav ── */}
      <div className="detail-topnav">
        <button className="detail-back-btn" onClick={onGoHome}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Inicio
        </button>
        <button className="detail-new-btn" onClick={onCreateProject}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Nuevo proyecto
        </button>
      </div>

      {/* ── Single unified card ── */}
      <div className="detail-card">
        <WaveformDecor />

        {/* Card top: info + actions */}
        <div className="detail-card-body">
          <div className="detail-project-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 19V6l12-3v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="18" cy="15" r="3" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
          </div>

          <h1 className="detail-hero-title">{project.name}</h1>

          {project.description && (
            <p className="detail-hero-desc">{project.description}</p>
          )}

          {/* Stats */}
          <div className="detail-stats">
            <div className="detail-stat">
              <span className="detail-stat-value">{loadingVersions ? '…' : versions.length}</span>
              <span className="detail-stat-label">versiones</span>
            </div>
            <div className="detail-stat-divider" />
            <div className="detail-stat">
              <span className="detail-stat-value">
                {latestVersion
                  ? formatDate(latestVersion.uploaded_at || latestVersion.created_at).split(' ')[0]
                  : '—'}
              </span>
              <span className="detail-stat-label">última subida</span>
            </div>
            {latestVersion?.size && (
              <>
                <div className="detail-stat-divider" />
                <div className="detail-stat">
                  <span className="detail-stat-value">{formatBytes(latestVersion.size)}</span>
                  <span className="detail-stat-label">tamaño</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button className="detail-action-primary" onClick={() => setShowUpload(true)}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
              Subir versión
            </button>

            <button
              className={`detail-action-secondary${showVersions ? ' active' : ''}`}
              onClick={() => setShowVersions(v => !v)}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Historial
              {versions.length > 0 && (
                <span className="detail-action-badge">{versions.length}</span>
              )}
            </button>

            {latestVersion && (
              <button className="detail-action-ghost"
                onClick={() => downloadVersion(latestVersion.id, latestVersion.filename)}>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Última versión
              </button>
            )}
          </div>
        </div>

        {/* ── Historial — dentro de la misma card ── */}
        {showVersions && (
          <div className="detail-versions">
            <div className="detail-versions-divider" />

            <div className="detail-versions-header">
              <span className="detail-versions-title">Historial de versiones</span>
              <span className="detail-versions-count">
                {loadingVersions ? '…' : `${versions.length} versión${versions.length !== 1 ? 'es' : ''}`}
              </span>
            </div>

            {loadingVersions && (
              <div className="versions-loading">
                <span className="btn-spinner accent" /> Cargando…
              </div>
            )}
            {!loadingVersions && versionsError && (
              <p className="versions-error">{versionsError}</p>
            )}
            {!loadingVersions && !versionsError && versions.length === 0 && (
              <div className="versions-empty-state">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M6 21a3 3 0 100-6 3 3 0 000 6zm12-3a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
                <p>Todavía no hay versiones. ¡Subí la primera!</p>
              </div>
            )}
            {!loadingVersions && versions.length > 0 && (
              <ul className="versions-list">
                {versions.map((v, idx) => (
                  <li key={v.id ?? v.filename} className="version-item">
                    <span className="version-number">v{versions.length - idx}</span>
                    <div className="version-item-info">
                      <span className="version-item-name">{v.description || v.filename}</span>
                      <span className="version-item-meta">
                        {formatDate(v.uploaded_at || v.created_at)}
                        {v.size ? ` · ${formatBytes(v.size)}` : ''}
                      </span>
                    </div>
                    <button className="version-download-btn"
                      onClick={() => downloadVersion(v.id, v.filename)}
                      aria-label="Descargar" title="Descargar">
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Upload modal ── */}
      {showUpload && (
        <UploadModal
          projectId={project.id}
          onSuccess={loadVersions}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}

export default ProjectDetail;

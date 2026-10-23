import { useState, useEffect, useRef } from 'react';
import { uploadFile, downloadVersion, updateVersionTags, setProjectVisibility } from '../services/apiClient';
import axios from 'axios';
import TagPicker from './TagPicker';
import { getTokens } from '../services/tokenStore';
import './ProjectDetail.css';

const API_BASE = 'http://localhost:3000';

async function fetchVersions(projectId) {
  const { accessToken } = getTokens();
  try {
    const response = await axios.get(`${API_BASE}/versions/project/${projectId}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
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
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}pm`;
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
  fill="#f015a0" opacity={0.10 + (i % 5) * 0.035} />
      ))}
    </svg>
  );
}

// ─── Upload modal ─────────────────────────────────────────────────────────────
function UploadModal({ projectId, onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setErrorMsg('Seleccioná un archivo .flp'); return; }
    if (!description.trim()) { setErrorMsg('La descripción es obligatoria'); return; }
    setStatus('uploading');
    setErrorMsg('');
    const result = await uploadFile({ file, description: description.trim(), project_id: projectId, tags });
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

          <TagPicker
            tags={tags}
            onChange={setTags}
            disabled={status === 'uploading'}
            label="Etiquetas"
          />

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

// ─── Tag editor modal ─────────────────────────────────────────────────────────
function TagEditorModal({ version, onSave, onClose }) {
  const [tags, setTags] = useState(
    Array.isArray(version.tags) ? [...version.tags] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await updateVersionTags(version.id, tags);
    setSaving(false);
    if (result.ok) {
      onSave(version.id, tags);
      onClose();
    } else {
      setError(result.error || 'No se pudo guardar');
    }
  };

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal tag-editor-modal">
        <div className="upload-modal-header">
          <div className="upload-modal-title">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            Etiquetas — {version.description || version.filename}
          </div>
          <button className="upload-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <div className="tag-editor-body">
          <TagPicker
            tags={tags}
            onChange={setTags}
            disabled={saving}
            label="Etiquetas de esta versión"
          />

          {error && <p className="modal-error">{error}</p>}

          <button
            className={`modal-submit-btn${saving ? ' loading' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <span className="btn-spinner" />}
            {saving ? 'Guardando…' : 'Guardar etiquetas'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Version row menu ─────────────────────────────────────────────────────────
function VersionMenu({ version, onEditTags, onDownload }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="version-menu-wrap" ref={menuRef}>
      <button
        className="version-menu-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="Opciones"
        aria-expanded={open}
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4"  r="1.5"/>
          <circle cx="10" cy="10" r="1.5"/>
          <circle cx="10" cy="16" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div className="version-menu-dropdown">
          <button className="version-menu-item" onClick={() => { setOpen(false); onDownload(); }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Descargar
          </button>
          <button className="version-menu-item" onClick={() => { setOpen(false); onEditTags(); }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            Editar etiquetas
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ProjectDetail({ project, onGoHome, onCreateProject, onProjectUpdated }) {
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editingTagsFor, setEditingTagsFor] = useState(null);

  // Visibility state — initialise from the project prop (null treated as false)
  const [isPublic, setIsPublic] = useState(project.public === true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [visibilityError, setVisibilityError] = useState('');

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
    setIsPublic(project.public === true);
    setVisibilityError('');
    loadVersions();
  }, [project.id]);

  const handleTagsSaved = (versionId, newTags) => {
    setVersions(prev =>
      prev.map(v => v.id === versionId ? { ...v, tags: newTags } : v)
    );
  };

  const handleToggleVisibility = async () => {
    const next = !isPublic;
    setTogglingVisibility(true);
    setVisibilityError('');
    const result = await setProjectVisibility(project.id, next);
    setTogglingVisibility(false);
    if (result.ok) {
      setIsPublic(next);
      // Notify parent so the sidebar badge can update too
      onProjectUpdated?.({ ...project, public: next });
    } else {
      setVisibilityError(result.error);
    }
  };

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

          {/* Decorative rings — sound wave / radial motif */}
          <svg className="detail-card-decor-rings" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <circle cx="100" cy="100" r="40"  stroke="#f015a0" strokeWidth="1.2" opacity="0.18"/>
            <circle cx="100" cy="100" r="62"  stroke="#f015a0" strokeWidth="1"   opacity="0.13"/>
            <circle cx="100" cy="100" r="84"  stroke="#f015a0" strokeWidth="0.8" opacity="0.09"/>
            <circle cx="100" cy="100" r="106" stroke="#f015a0" strokeWidth="0.6" opacity="0.06"/>
            <circle cx="100" cy="100" r="8"   fill="#f015a0"   opacity="0.25"/>
          </svg>

          {/* Visibility toggle — top right corner */}
          <button
            className={`detail-visibility-btn${isPublic ? ' is-public' : ' is-private'}`}
            onClick={handleToggleVisibility}
            disabled={togglingVisibility}
            title={isPublic ? 'Público — click para hacer privado' : 'Privado — click para hacer público'}
          >
            {togglingVisibility ? (
              <span className="btn-spinner" aria-hidden="true" />
            ) : isPublic ? (
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
            )}
            {isPublic ? 'Público' : 'Privado'}
          </button>

          {visibilityError && (
            <p className="detail-visibility-error" role="alert">{visibilityError}</p>
          )}

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

            {latestVersion && (
              <button className="detail-action-ghost"
                onClick={() => downloadVersion(latestVersion.id, latestVersion.filename)}>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Abrir ultima versión
              </button>
            )}
          </div>

          {/* Cambios — full width, below the other actions */}
          <button
            className={`detail-action-versions-toggle${showVersions ? ' active' : ''}`}
            onClick={() => setShowVersions(v => !v)}
          >
            <span className="detail-action-versions-toggle-left">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Cambios
              {versions.length > 0 && (
                <span className="detail-action-badge">{versions.length}</span>
              )}
            </span>
            <svg
              className={`detail-action-chevron${showVersions ? ' open' : ''}`}
              width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* ── Historial — dentro de la misma card ── */}
        {showVersions && (
          <div className="detail-versions">
            <div className="detail-versions-divider" />

            <div className="detail-versions-header">
              <span className="detail-versions-title">Cambios — {loadingVersions ? '…' : versions.length} versiones</span>
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
                  <li key={v.id ?? v.filename} className={`version-item${idx === 0 ? ' version-item--latest' : ''}`}>
                    {/* Music note icon */}
                    <div className="version-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M9 19V6l12-3v13" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="15" r="3"/>
                      </svg>
                    </div>

                    {/* Info block */}
                    <div className="version-item-info">
                      <div className="version-item-top-row">
                        <span className="version-item-name">{v.description || v.filename}</span>
                        {/* Tags */}
                        {Array.isArray(v.tags) && v.tags.length > 0 && (
                          <div className="version-tags">
                            {v.tags.map(tag => (
                              <span key={tag} className="version-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="version-item-meta">
                        {formatDate(v.uploaded_at || v.created_at)}
                        {v.size ? ` · ${formatBytes(v.size)}` : ''}
                      </span>
                    </div>

                    {/* Download button */}
                    <button className="version-download-btn"
                      onClick={() => downloadVersion(v.id, v.filename)}
                      aria-label="Descargar" title="Descargar">
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>

                    {/* Three-dot menu */}
                    <VersionMenu
                      version={v}
                      onEditTags={() => setEditingTagsFor(v)}
                      onDownload={() => downloadVersion(v.id, v.filename)}
                    />
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

      {/* ── Tag editor modal ── */}
      {editingTagsFor && (
        <TagEditorModal
          version={editingTagsFor}
          onSave={handleTagsSaved}
          onClose={() => setEditingTagsFor(null)}
        />
      )}
    </div>
  );
}

export default ProjectDetail;

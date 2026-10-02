import './ProjectSidebar.css';

function ProjectSidebar({ projects, selectedId, onSelect, onCreateProject, loading }) {
  return (
    <aside className="project-sidebar" aria-label="Mis proyectos">
      <div className="sidebar-header">
        <span className="sidebar-title">Proyectos</span>
        {loading && <span className="sidebar-loading-dot" aria-label="Cargando" />}
      </div>

      <button className="sidebar-new-btn" onClick={onCreateProject}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Nuevo proyecto
      </button>

      {!loading && projects.length === 0 && (
        <p className="sidebar-empty">Sin proyectos aún</p>
      )}

      <ul className="sidebar-list">
        {projects.map((p) => {
          const active = p.id === selectedId;
          return (
            <li key={p.id}>
              <button
                className={`sidebar-item${active ? ' active' : ''}`}
                onClick={() => onSelect(p)}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`sidebar-dot${active ? ' active' : ''}`} />
                <span className="sidebar-item-name">{p.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default ProjectSidebar;

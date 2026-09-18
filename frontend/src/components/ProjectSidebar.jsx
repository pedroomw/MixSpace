import './ProjectSidebar.css';

function ProjectSidebar({ projects, selectedId, onSelect, loading }) {
  return (
    <aside className="project-sidebar" aria-label="Mis proyectos">
      <div className="sidebar-header">
        <span className="sidebar-title">Proyectos</span>
        {loading && <span className="sidebar-loading-dot" aria-label="Cargando" />}
      </div>

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

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
                {p.public
                  ? <span className="sidebar-visibility-badge public" title="Público">
                      <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor" aria-label="Público">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                      </svg>
                    </span>
                  : <span className="sidebar-visibility-badge private" title="Privado">
                      <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor" aria-label="Privado">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </span>
                }
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default ProjectSidebar;

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import HomeHero from './components/HomeHero';
import ProjectSidebar from './components/ProjectSidebar';
import ProjectDetail from './components/ProjectDetail';
import CreateProjectModal from './components/CreateProjectModal';
import { getProjects, createProject, resolvePluginSession, getMe } from './services/apiClient';
import logoImg from '../imagenes/Logo mixspace fucsia.jfif';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Projects
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Create project modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Plugin session banner
  const [pluginSessionStatus, setPluginSessionStatus] = useState(null);

  const pluginSessionId = new URLSearchParams(window.location.search).get('sessionId');

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mixspace_user');
    const storedToken = localStorage.getItem('mixspace_token');
    if (storedUser && storedToken) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Enrich with server profile if id or created_at are missing
      if (!parsed.id || !parsed.created_at) {
        getMe().then((result) => {
          if (result.ok) {
            const enriched = { ...parsed, ...result.user };
            setUser(enriched);
            localStorage.setItem('mixspace_user', JSON.stringify(enriched));
          }
        });
      }
    }
    setCheckingSession(false);
  }, []);

  // Fetch projects after login
  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);
    getProjects().then((result) => {
      setLoadingProjects(false);
      if (result.ok) setProjects(result.projects);
    });
  }, [user]);

  // Resolve plugin session once logged in
  useEffect(() => {
    if (!user || !pluginSessionId) return;
    const token = localStorage.getItem('mixspace_token');
    if (!token) return;

    setPluginSessionStatus('resolving');
    resolvePluginSession(pluginSessionId, token).then((result) => {
      setPluginSessionStatus(result.ok ? 'resolved' : 'error');
      if (result.ok) window.history.replaceState({}, '', window.location.pathname);
    });
  }, [user, pluginSessionId]);

  const handleLogout = () => {
    localStorage.removeItem('mixspace_token');
    localStorage.removeItem('mixspace_user');
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
  };

  const handleLoginSuccess = async (u) => {
    // Enrich the user object with server profile data (id, created_at)
    const result = await getMe();
    const enriched = result.ok ? { ...u, ...result.user } : u;
    localStorage.setItem('mixspace_user', JSON.stringify(enriched));
    setUser(enriched);
  };

  const handleOpenCreateModal = () => {
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    if (creatingProject) return;
    setShowCreateModal(false);
    setCreateError(null);
  };

  const handleCreateProject = async ({ name, description, tags = [] }) => {
    setCreatingProject(true);
    setCreateError(null);

    const result = await createProject({ name, description, tags });

    setCreatingProject(false);

    if (!result.ok) {
      setCreateError(result.error);
      return;
    }

    // Refresh the full project list so the sidebar stays in sync
    const listResult = await getProjects();
    if (listResult.ok) setProjects(listResult.projects);

    setShowCreateModal(false);
    setCreateError(null);
  };

  // Derive display name for the hero
  const heroName = (() => {
    const email = user?.email || '';
    if (email.includes('@')) return email.split('@')[0];
    return email || 'there';
  })();

  if (checkingSession) return null;

  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} onGoHome={() => setSelectedProject(null)} />

      {pluginSessionStatus === 'resolving' && (
        <div className="plugin-banner resolving">Conectando con FL Studio…</div>
      )}
      {pluginSessionStatus === 'resolved' && (
        <div className="plugin-banner resolved">✓ Sesión de plugin autorizada. Podés cerrar esta pestaña.</div>
      )}
      {pluginSessionStatus === 'error' && (
        <div className="plugin-banner error">No se pudo conectar con el plugin. La sesión puede haber expirado.</div>
      )}

      <div className="workspace">
        {/* Left / main area */}
        <main className="workspace-main">
          {selectedProject
            ? <ProjectDetail
                project={selectedProject}
                key={selectedProject.id}
                onGoHome={() => setSelectedProject(null)}
                onCreateProject={handleOpenCreateModal}
              />
            : <HomeHero username={heroName} onCreateProject={handleOpenCreateModal} projectCount={projects.length} />
          }
        </main>

        {/* Right sidebar — project list */}
        <ProjectSidebar
          projects={projects}
          selectedId={selectedProject?.id}
          onSelect={(p) => setSelectedProject(p.id === selectedProject?.id ? null : p)}
          onCreateProject={handleOpenCreateModal}
          loading={loadingProjects}
        />
      </div>

      {/* Create project modal */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateProject}
        loading={creatingProject}
        error={createError}
      />

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src={logoImg} alt="MixSpace" className="footer-logo-img" />
          </div>
          <span className="footer-credits">By Pods and Peps. &nbsp; All credits reserved to MixSpace Co.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

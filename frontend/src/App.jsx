import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import HomeHero from './components/HomeHero';
import ProjectSidebar from './components/ProjectSidebar';
import ProjectDetail from './components/ProjectDetail';
import { getProjects, resolvePluginSession } from './services/apiClient';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Projects
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Plugin session banner
  const [pluginSessionStatus, setPluginSessionStatus] = useState(null);

  const pluginSessionId = new URLSearchParams(window.location.search).get('sessionId');

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mixspace_user');
    const storedToken = localStorage.getItem('mixspace_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
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

  const handleLoginSuccess = (u) => {
    setUser(u);
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
      <Header user={user} onLogout={handleLogout} />

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
            ? <ProjectDetail project={selectedProject} key={selectedProject.id} />
            : <HomeHero username={heroName} onCreateProject={() => {}} />
          }
        </main>

        {/* Right sidebar — project list */}
        <ProjectSidebar
          projects={projects}
          selectedId={selectedProject?.id}
          onSelect={setSelectedProject}
          loading={loadingProjects}
        />
      </div>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <svg width="24" height="17" viewBox="0 0 46 32" fill="none">
              <rect x="0"  y="8"  width="5" height="16" rx="2.5" fill="#c084fc" opacity="0.8"/>
              <rect x="8"  y="4"  width="5" height="24" rx="2.5" fill="#c084fc" opacity="0.8"/>
              <rect x="16" y="0"  width="5" height="32" rx="2.5" fill="#c084fc" opacity="0.8"/>
              <rect x="24" y="6"  width="5" height="20" rx="2.5" fill="#c084fc" opacity="0.8"/>
              <rect x="32" y="10" width="5" height="12" rx="2.5" fill="#c084fc" opacity="0.8"/>
            </svg>
            MixSpace<sup>®</sup>
          </div>
          <span className="footer-credits">By Pods and Peps. &nbsp; All credits reserved to MixSpace Co.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

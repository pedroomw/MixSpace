import { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUploadForm from './components/FileUploadForm';
import Login from './components/Login';
import './App.css';

const SIMULATED_PROJECTS = [
  { id: 1, name: 'Proyecto_1', meta: 'Beat para TheMorbidColossus, 128 bpm', active: true },
  { id: 2, name: 'Proyecto_2', meta: 'Trap loop, 140 bpm' },
  { id: 3, name: 'Verano_Mix', meta: 'Demo R&B, 95 bpm' },
  { id: 4, name: 'Nocturno_v3', meta: 'Ambient, 70 bpm' },
  { id: 5, name: 'Club_Edit_Final', meta: 'House, 128 bpm' },
  { id: 6, name: 'Proyecto_6', meta: 'Sin terminar, 110 bpm' },
];

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mixspace_user');
    const storedToken = localStorage.getItem('mixspace_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setCheckingSession(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mixspace_token');
    localStorage.removeItem('mixspace_user');
    setUser(null);
  };

  if (checkingSession) {
    return null;
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="form-area">
          <FileUploadForm />
        </div>

        <aside className="projects-panel" aria-label="Mis proyectos">
          <div className="projects-panel-header">
            <h2 className="projects-panel-title">Proyectos</h2>
          </div>
          <ul className="projects-list">
            {SIMULATED_PROJECTS.map((p) => (
              <li key={p.id} className={`project-item${p.active ? ' active' : ''}`}>
                <span className={`project-dot${p.active ? ' playing' : ''}`} />
                <div className="project-info">
                  <div className="project-name">{p.name}</div>
                  <div className="project-meta">{p.meta}</div>
                </div>
                <span className="project-arrow">›</span>
              </li>
            ))}
          </ul>
        </aside>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <svg width="28" height="20" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="5" width="3" height="6" rx="1.5" fill="#c084fc" opacity="0.8"/>
              <rect x="4.5" y="2" width="3" height="12" rx="1.5" fill="#c084fc" opacity="0.8"/>
              <rect x="9" y="0" width="3" height="16" rx="1.5" fill="#c084fc" opacity="0.8"/>
              <rect x="13.5" y="3" width="3" height="10" rx="1.5" fill="#c084fc" opacity="0.8"/>
              <rect x="18" y="6" width="3" height="5" rx="1.5" fill="#c084fc" opacity="0.8"/>
            </svg>
            MixSpace<sup style={{ fontSize: '10px', verticalAlign: 'super' }}>®</sup>
          </div>
          <span className="footer-credits">By Pods and Peps. &nbsp;&nbsp; All credits reserved to MixSpace Co.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
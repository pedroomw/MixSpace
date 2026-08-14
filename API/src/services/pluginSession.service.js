// Almacena sesiones temporales de login iniciadas desde el plugin de FL Studio
// sessionId -> { token, createdAt }

class PluginSessionService {
  constructor() {
    this.sessions = new Map();
    this.EXPIRATION_MS = 5 * 60 * 1000;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.sessions.entries()) {
        if (now - session.createdAt > this.EXPIRATION_MS) {
          this.sessions.delete(id);
        }
      }
    }, 60 * 1000);
  }

  createPendingSession(sessionId) {
    this.sessions.set(sessionId, { token: null, createdAt: Date.now() });
  }

  resolveSession(sessionId, token) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.token = token;
    return true;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const isExpired = Date.now() - session.createdAt > this.EXPIRATION_MS;
    if (isExpired) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

export default PluginSessionService;
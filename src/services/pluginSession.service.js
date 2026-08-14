### [pluginSession.service.js](file:///c%3A/Users/devandroid/Downloads/MixSpace/src/services/pluginSession.service.js)

Refactorizo el servicio a clase, manteniendo la misma lógica de sesiones y el cleanup automático dentro del objeto.

```javascript
class PluginSessionService {
  constructor() {
    this.sessions = new Map();
    this.SESSION_TTL = 5 * 60 * 1000;
    this.CLEANUP_INTERVAL = 60 * 1000;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt <= now) {
          this.sessions.delete(sessionId);
        }
      }
    }, this.CLEANUP_INTERVAL);
  }

  createPendingSession(sessionId) {
    const existingSession = this.sessions.get(sessionId);

    if (existingSession) {
      return existingSession;
    }

    const session = {
      sessionId,
      token: null,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TTL,
    };

    this.sessions.set(sessionId, session);

    return session;
  }

  resolveSession(sessionId, token) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    session.token = token;
    session.resolvedAt = Date.now();
    session.expiresAt = Date.now() + this.SESSION_TTL;

    return session;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
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
```

### [auth-controller.js](file:///c%3A/Users/devandroid/Downloads/MixSpace/src/controllers/auth-controller.js)

```javascript
import authService from '../services/auth-service.js'
import PluginSessionService from '../services/pluginSession.service.js'

const authService = new AuthService()
const pluginSessionService = new PluginSessionService()

export const iniciarSesionPlugin = async (req, res) => {
  const { sessionId } = req.body;
  const session = pluginSessionService.createPendingSession(sessionId);
  // ...existing logic
};

export const resolverSesionPlugin = async (req, res) => {
  const { sessionId, token } = req.body;
  const session = pluginSessionService.resolveSession(sessionId, token);
  // ...existing logic
};

export const consultarSesionPlugin = async (req, res) => {
  const { sessionId } = req.body;
  const session = pluginSessionService.getSession(sessionId);
  // ...existing logic
};
```
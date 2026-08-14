import AuthService from '../services/auth-service.js';
import PluginSessionService from '../services/pluginSession.service.js';

const authService = new AuthService();
const pluginSessionService = new PluginSessionService();

class AuthController {
  // ...existing code...

  async iniciarSesionPlugin(req, res) {
    try {
      const { sessionId } = req.body;
      const session = pluginSessionService.createPendingSession(sessionId);

      return res.status(200).json({ ok: true, session });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async resolverSesionPlugin(req, res) {
    try {
      const { sessionId, token } = req.body;
      const session = pluginSessionService.resolveSession(sessionId, token);

      if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada' });
      }

      return res.status(200).json({ ok: true, session });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async consultarSesionPlugin(req, res) {
    try {
      const { sessionId } = req.params;
      const session = pluginSessionService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada' });
      }

      return res.status(200).json({ ok: true, session });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ...existing code...
}

export default AuthController;
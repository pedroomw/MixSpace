import AuthService from '../services/auth-service.js'
import PluginSessionService from '../services/pluginSession.service.js'

const authService = new AuthService()
const pluginSessionService = new PluginSessionService()

class AuthController {
    register = async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' })
            }
            const result = await authService.register(email, password)
            res.status(201).json(result)
        } catch (error) {
            console.log('Error en register: ' + error.message)
            res.status(400).json({ error: error.message })
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' })
            }
            const token = await authService.login(email, password)
            res.status(200).json(token)
        } catch (error) {
            console.log('Error en login: ' + error.message)
            res.status(401).json({ error: error.message })
        }
    }

    iniciarSesionPlugin = (req, res) => {
        const sessionId = req.params.sessionId

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId requerido' })
        }

        pluginSessionService.createPendingSession(sessionId)
        return res.status(201).json({ ok: true })
    }

    resolverSesionPlugin = (req, res) => {
        const sessionId = req.params.sessionId
        const { token } = req.body

        if (!sessionId || !token) {
            return res.status(400).json({ error: 'sessionId y token son requeridos' })
        }

        const ok = pluginSessionService.resolveSession(sessionId, token)

        if (!ok) {
            return res.status(404).json({ error: 'Sesión no encontrada o expirada' })
        }

        return res.status(200).json({ ok: true })
    }

    consultarSesionPlugin = (req, res) => {
        const sessionId = req.params.sessionId
        const session = pluginSessionService.getSession(sessionId)

        if (!session) {
            return res.status(404).json({ status: 'expired' })
        }

        if (!session.token) {
            return res.status(200).json({ status: 'pending' })
        }

        const token = session.token
        pluginSessionService.deleteSession(sessionId)

        return res.status(200).json({ status: 'ready', token })
    }
}

export default AuthController
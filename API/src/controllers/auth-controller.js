import AuthService from '../services/auth-service.js'
import PluginSessionService from '../services/pluginSession.service.js'

const authService = new AuthService()
const pluginSessionService = new PluginSessionService()

class AuthController {
    register = async (req, res) => {
        try {
            const { email, password, country, username } = req.body
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' })
            }
            const result = await authService.register(email, password, country, username)
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
            const tokens = await authService.login(email, password)
            res.status(200).json(tokens)
        } catch (error) {
            console.log('Error en login: ' + error.message)
            res.status(401).json({ error: error.message })
        }
    }

    /**
     * POST /auth/refresh
     * Body: { refresh_token: string }
     * Returns: { access_token: string, refresh_token: string }
     */
    refresh = async (req, res) => {
        try {
            const { refresh_token } = req.body
            if (!refresh_token) {
                return res.status(400).json({ error: 'refresh_token es requerido' })
            }
            const tokens = await authService.refresh(refresh_token)
            res.status(200).json(tokens)
        } catch (error) {
            console.log('Error en refresh: ' + error.message)
            res.status(401).json({ error: error.message })
        }
    }

    /**
     * POST /auth/logout  (optional but recommended)
     * Invalidates the refresh token stored in the DB.
     */
    logout = async (req, res) => {
        try {
            await authService.logout(req.user.userId)
            res.status(200).json({ ok: true })
        } catch (error) {
            res.status(500).json({ error: error.message })
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

    getMe = async (req, res) => {
        const userID = req.user.userId
        try {
            const myUser = await authService.getMyUser(userID)
            return res.status(200).json(myUser)
        } catch (err) {
            return res.status(500).json({ error: err.message || 'Error al obtener el perfil' })
        }
    }
}

export default AuthController

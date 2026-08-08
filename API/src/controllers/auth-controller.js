import AuthService from '../services/auth-service.js'

const authService = new AuthService()

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
}

export default AuthController
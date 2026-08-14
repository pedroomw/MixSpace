import { Router } from 'express'
import AuthController from '../controllers/auth-controller.js'

const router = Router()
const authController = new AuthController()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/plugin-session/:sessionId', authController.iniciarSesionPlugin);
router.post('/plugin-session/:sessionId/resolve', authController.resolverSesionPlugin);
router.get('/plugin-session/:sessionId', authController.consultarSesionPlugin);
export default router
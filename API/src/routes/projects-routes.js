import { Router } from "express"
import authMiddleware from '../middlewares/auth-middleware.js'
import ProjectsController from "../controllers/projects-controller.js";

const router = Router()

const controller = new ProjectsController();

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de proyectos' })
})

router.use(authMiddleware)

router.get('/mine' , controller.GetProjectsByUserID)

export default router


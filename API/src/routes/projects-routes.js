import { Router } from "express"
import authMiddleware from '../middlewares/auth-middleware.js'
import ProjectsController from "../controllers/projects-controller.js"

const router = Router()
const controller = new ProjectsController()

// All project routes require auth
router.use(authMiddleware)

router.get('/',     controller.GetProjectsByUserID)
router.get('/mine', controller.GetProjectsByUserID)
router.post('/',    controller.CreateProject)
router.patch('/:id/visibility', controller.SetProjectVisibility)

export default router

import { Router } from "express"
import authMiddleware from '../middlewares/auth-middleware.js'
import ProjectsController from "../controllers/projects-controller.js";

const router = Router()
const controller = new ProjectsController();

// All project routes require auth
router.use(authMiddleware)

// GET /projects      — used by the plugin and the frontend
// GET /projects/mine — legacy alias, same behaviour
router.get('/',     controller.GetProjectsByUserID)
router.get('/mine', controller.GetProjectsByUserID)
router.post('/', controller.CreateProject)

export default router

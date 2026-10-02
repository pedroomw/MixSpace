import { Router } from "express"
import upload from '../helpers/multer.js'
import VersionController from '../controllers/version-controller.js'
import authMiddleware from '../middlewares/auth-middleware.js'

const router = Router()
const controller = new VersionController();

router.use(authMiddleware)

router.post('/upload',
    upload.single("file"),
    controller.uploadVersion
)

router.get('/project/:projectId', controller.getVersionsByProject)

router.get('/download/:id', controller.downloadVersion)

export default router

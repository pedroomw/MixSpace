import { Router } from "express"
import upload from '../helpers/multer.js'
import VersionController from '../controllers/version-controller.js'
import authMiddleware from '../middlewares/auth-middleware.js'

const router = Router()

const controller = new VersionController();

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de versiones' })
})

router.use(authMiddleware)

router.post('/upload', 
    upload.single("file"),
    controller.uploadVersion
)

router.get('/:id', async (req,res) => {

})

export default router


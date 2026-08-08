import { Router } from "express"
import upload from '../helpers/multer.js'
import VersionController from '../controllers/version-controller.js'

const router = Router()

const controller = new VersionController();

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de versiones' })
})

router.post('/upload', 
    upload.single("file"),
    controller.uploadVersion
)

router.get('/:id', async (req,res) => {

})

export default router


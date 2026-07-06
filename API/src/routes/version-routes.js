import { Router } from "express"
import upload from '../helpers/multer.js'
import VersionController from '../controllers/version-controller.js'
import VerifiersMiddleware from "../middlewares/verifiers-middlewares.js"
import FilesMiddleware from "../middlewares/files-middlewares.js"

const router = Router()

const verifier = new VerifiersMiddleware();
const controller = new VersionController();
const filemiddleware = new FilesMiddleware();

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de versiones' })
})

router.post('/upload', 
    upload.single('file'), 
    verifier.verifyRequest,
    filemiddleware.setFilename, 
    verifier.verifyVersion, 
    controller.uploadVersion
)

router.get('/:id', async (req,res) => {

})

export default router


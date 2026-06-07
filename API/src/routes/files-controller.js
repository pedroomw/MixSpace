import path from "path"
import fs from "fs"
import { Router } from "express"
import multer from 'multer'
import SupabaseService from '../services/supabase-service.js'

const router = Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    file.filename = Date.now() + '-' + Math.random().toString(36).slice(2,8) + path.extname(file.originalname) //path es un objeto con una funcion que extrae la extensión. le mnado el nombre completo
    cb(null, file.filename)
  }
})
const upload = multer({ storage })

const svc = new SupabaseService()


router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de archivos' })
})

router.post('/upload', upload.single('file'), async (req, res) => {
	console.log("llega al .post")
	try {
		if (req.file) {
			const {status, result} = await svc.uploadMetadata(req.filename, req.body.description, req.body.projectID)
			res.status(status).json(result)
		} else {
			res.status(400).json({ error: 'No file provided (field name: file)' })
		}
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message || 'upload failed' })
	}
})

export default router


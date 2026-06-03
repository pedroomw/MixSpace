import path from "path"
import fs from "fs"
import { Router } from "express"
import multer from 'multer'
import { uploadMetadata } from '../services/supabaseDatabase.js'

const router = Router()
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:\\Users\\49552421\\Uploads')
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + Math.random().toString(36).slice(2,8) + path.extname(file.originalname)
    cb(null, name)
  }
})

const upload = multer({ storage })

//Upload.single('file') significa que recibe la función de upload de multer, y "file" es el name del form donde se envió el archivo. En front.
router.post('/upload', upload.single('file'), async (req, res) => {

	try {
		if (!req.file) return res.status(400).json({ error: 'No file provided (field name: file)' })

		const result = await uploadMetadata({
			filename, 
			description, 
			projectID
		})

		res.json({ ok: true, result })

	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message || 'upload failed' })
	}
})

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de archivos' })
})

export default router


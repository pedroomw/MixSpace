import path from "path"
import fs from "fs"
import { Router } from "express"
import multer from 'multer'
import { uploadFile } from '../services/supabaseStorage.js'

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

//recibe campo 'file' en multipart/form-data
router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file provided (field name: file)' })

		const originalName = req.file.originalname
		const ext = path.extname(originalName)
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`
		const filePath = filename

		const result = await uploadFile({
			bucket: process.env.SUPABASE_BUCKET,
			filePath,
			fileBuffer: req.file.buffer,
			contentType: req.file.mimetype
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


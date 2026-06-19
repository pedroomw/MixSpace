import setFileName from '../helpers/files.js'
import { Router } from "express"
import upload from '../helpers/multer.js'
import SupabaseService from '../services/supabase-service.js'

const router = Router()

const svc = new SupabaseService()

router.get('/', (req, res) => {
    res.json({ mensaje: 'Endpoint de versiones' })
})

router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		if (req.file) {
			const result = await svc.uploadVersion(req.file.filename, req.body.description, req.body.projectID)
			res.status(201).json(result)
		} else {
			res.status(400).json({ error: 'No file provided (field name: file)' })
		}
	} 
	catch (error) {
		console.error(error)
		res.status(500).json({ error: err.message || 'upload failed' })
	}
})

export default router


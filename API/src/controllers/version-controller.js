import SupabaseService from "../services/versions-service.js"

const svc = new SupabaseService()

class VersionController{
	uploadVersion = async (req, res) => {
		try {
			req.file.filename = req.body.filename
			if (req.file) {
				console.log(req.body)
				console.log(req.file)
				const metadata = { ...req.body }
				const file = req.file
				const result = await svc.uploadVersion(metadata, file)
				res.status(201).json(result)
			} else {
				res.status(400).json({ error: 'No file provided (field name: file)' })
			}
		} 
		catch (error) {
			res.status(500).json({ cause: error.cause|| 'upload failed' })
		}
	}
}

export default VersionController
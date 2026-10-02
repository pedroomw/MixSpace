import SupabaseService from "../services/versions-service.js"

const svc = new SupabaseService()

class VersionController{
	uploadVersion = async (req, res) => {
		try {
			if (req.file) {
				const {description, project_id} = req.body
				const file = req.file
				const result = await svc.uploadVersion(description, project_id, file)
				res.status(201).json(result)
			} else {
				res.status(400).json({ error: 'No file provided (field name: file)' })
			}
		} 
		catch (error) {
			res.status(500).json({ cause: error.cause|| 'upload failed' })
		}
	}

	downloadVersion = async (req, res) => {
		try {
			const { id } = req.params
			if (!id) return res.status(400).json({ error: 'id requerido' })

			const { signedUrl, filename } = await svc.downloadVersion(id)

			// Redirigir al signed URL → el navegador / fetch descarga directo desde Supabase
			res.redirect(signedUrl)
		} catch (error) {
			const status = error.message === 'Versión no encontrada' ? 404 : 500
			res.status(status).json({ error: error.message })
		}
	}

	getVersionsByProject = async (req, res) => {
		try {
			const { projectId } = req.params
			if (!projectId) return res.status(400).json({ error: 'projectId requerido' })
			console.log(`[versions] getVersionsByProject projectId="${projectId}" user="${req.user?.userId}"`)
			const versions = await svc.getVersionsByProject(projectId)
			console.log(`[versions] resultado: ${JSON.stringify(versions?.length ?? versions)}`)
			res.status(200).json(versions)
		} catch (error) {
			console.log(`[versions] error en getVersionsByProject: ${error.message}`)
			res.status(500).json({ error: error.message })
		}
	}
}

export default VersionController
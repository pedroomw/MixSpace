import ProjectsService from "../services/projects-service.js"

const svc = new ProjectsService()

class ProjectsController {
    GetProjectsByUserID = async (req, res) => {
        try {
            const userID = req.user.userId
            const result = await svc.GetProjectsByUserID(userID)
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    CreateProject = async (req, res) => {
        try {
            const userID      = req.user.userId
            const name        = req.body.name
            const description = req.body.description
            const tags        = Array.isArray(req.body.tags) ? req.body.tags : []
            const result      = await svc.CreateProject(userID, name, description, tags)
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    /**
     * PATCH /projects/:id/visibility
     * Body: { public: boolean }
     */
    SetProjectVisibility = async (req, res) => {
        try {
            const userID    = req.user.userId
            const projectID = req.params.id
            const isPublic  = req.body.public

            if (typeof isPublic !== 'boolean') {
                return res.status(400).json({ error: 'El campo "public" debe ser true o false' })
            }

            const project = await svc.SetProjectVisibility(projectID, userID, isPublic)
            res.status(200).json(project)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

export default ProjectsController

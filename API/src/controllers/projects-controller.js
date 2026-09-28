import ProjectsService from "../services/projects-service.js"

const svc = new ProjectsService()

class ProjectsController{
	GetProjectsByUserID = async (req, res) => {
        try{
            // JWT is signed with { userId } — use that key, not .id
            const userID = req.user.userId
            const result = await svc.GetProjectsByUserID(userID)
            res.status(200).json(result)
        }
        catch(error){
            res.status(500).json({ error: error.message })
        }
	}

    CreateProject = async (req, res) => {
        try {
            const userID = req.user.userId
            const name = req.body.name
            const description = req.body.description
            const result = await svc.CreateProject(userID, name, description)
            res.status(200).json(result)
        } catch(error){
            res.status(500).json({ error: error.message })
        }
    }
}

export default ProjectsController
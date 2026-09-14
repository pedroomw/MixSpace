import ProjectsService from "../services/projects-service.js"

const svc = new ProjectsService()

class ProjectsController{
	GetProjectsByUserID = async (req, res) => {
        try{
            const userID = req.user.id
            const result = await svc.GetProjectsByUserID(userID)
            res.status(200).json(result)
        }
        catch(error){
            res.status(500).json({ error: error.message })
        }
		
	}
}

export default ProjectsController
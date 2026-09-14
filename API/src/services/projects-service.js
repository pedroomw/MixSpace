import ProjectsRepository from "../repositories/projects-repository.js"

const repo = new ProjectsRepository()

class ProjectsService {
    GetProjectsByUserID = async (userID) => {
        if (!userID) throw new Error('userID es requerido')

        const projects = await repo.GetProjectsByUserID(userID)
        return projects
    }
}

export default ProjectsService
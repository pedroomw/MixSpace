import ProjectsRepository from "../repositories/projects-repository.js"

const repo = new ProjectsRepository()

class ProjectsService {
    GetProjectsByUserID = async (userID) => {
        if (!userID) throw new Error('userID es requerido')

        const projects = await repo.GetProjectsByUserID(userID)
        return projects
    }

    CreateProject = async (userID, name, description) => {
        if (!userID) throw new Error('userID es requerido')
        const project = await repo.CreateProject(userID, name, description)
        return project
    }
}

export default ProjectsService
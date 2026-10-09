import ProjectsRepository from "../repositories/projects-repository.js"

const repo = new ProjectsRepository()

class ProjectsService {
    GetProjectsByUserID = async (userID) => {
        if (!userID) throw new Error('userID es requerido')

        const projects = await repo.GetProjectsByUserID(userID)
        return projects
    }

    CreateProject = async (userID, name, description, tags = []) => {
        if (!userID) throw new Error('userID es requerido')
        const project = await repo.CreateProject(userID, name, description, tags)
        return project
    }
}

export default ProjectsService
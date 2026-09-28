import DatabaseRepository from '../repositories/database-repository.js';
import StorageRepository from '../repositories/storage-repository.js'
import setFileName from '../helpers/fileName-helper.js';

class SupabaseService {

    uploadVersion = async (description, project_id, file) => {
      try{
        const filename = setFileName(file.originalname)
        console.log(`[upload] description="${description}" project_id="${project_id}" filename="${filename}"`)
        const resultadoDatabase = await this.uploadVersionToDatabase(description, project_id, filename)
        console.log(`[upload] DB insert OK:`, JSON.stringify(resultadoDatabase))
        const resultadoStorage = await this.uploadFileToStorage(filename, file)
        console.log(`[upload] Storage upload OK:`, JSON.stringify(resultadoStorage))
        return ("Metadata y archivos subidos correctamente a la base de datos")
      }
      catch(error){
        console.log(`[upload] ERROR:`, error)
        throw error
      }
    }

    getVersionsByProject = async (project_id) => {
      try {
        const repo = new DatabaseRepository()
        return await repo.getVersionsByProject(project_id)
      } catch (error) {
        throw error
      }
    }

    uploadVersionToDatabase = async (description, project_id, filename) => {
      try{
        const repo = new DatabaseRepository()
        const resultado = await repo.uploadVersion(description, project_id, filename)
        return resultado
      }
      catch(error){ 
        throw error
      } 
    }

    uploadFileToStorage = async (filename, file) => {
      try {
        const repo = new StorageRepository()
        const resultado = await repo.uploadFile(filename, file)
        return resultado
      }
      catch(error){
        throw error
      }
    }

}

export default SupabaseService


import DatabaseRepository from '../repositories/SB-database-repository.js';
import StorageRepository from '../repositories/SB-storage-repository.js'

import setRandomFilename from '../helpers/files.js';

class SupabaseService {

    uploadVersion = async (metadata, file) => {
      try{
        const resultadoDatabase = await this.uploadVersionMetadata(metadata)
        const resultadoStorage = await this.uploadVersionFile(file)
        return ("Metadata y archivos subidos correctamente a la base de datos")
      }
      catch(error){
        throw error
      }
    }

    uploadVersionMetadata = async (metadata) => {
      try{
        const repo = new DatabaseRepository()
        const resultado = await repo.uploadVersion(metadata)
        return resultado
      }
      catch(error){ 
        throw error
      } 
    }

    uploadVersionFile = async (file) => {
      try {
        const repo = new StorageRepository()
        const resultado = await repo.uploadFile(file)
        return resultado
      }
      catch(error){
        throw error
      }
    }

}

export default SupabaseService


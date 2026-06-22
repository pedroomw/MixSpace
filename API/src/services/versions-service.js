import DatabaseRepository from '../repositories/SB-database-repository.js';
import StorageRepository from '../repositories/SB-storage-repository.js'
import {verifyVersionMetadata, verifyVersionFile} from '../helpers/version-helper.js'

class SupabaseService {

    uploadVersion = async (metadata, file) => {
      try{
        const resultadoDatabase = await this.uploadVersionMetadata(metadata)
        const resultadoStorage = await this.uploadVersionFile(file)
        const resultado = `Procesamiento correcto de Metadata y Archivo. MD: ${resultadoDatabase}`
      }
      catch(error){
        throw error
      }
    }


    uploadVersionMetadata = async (metadata) => {
      try{
        console.log(metadata)
        verifyVersionMetadata(metadata)
        const repo = new DatabaseRepository
        const resultado = await repo.uploadVersion(metadata)
        return resultado
      }
      catch(error){ 
        throw error
      } 
    }

    uploadVersionFile = async (file) => {
      try {
        verifyVersionFile(file)
        const repo = new StorageRepository
        const resultado = await repo.uploadFile(file)
        return resultado
      }
      catch(error){
        throw error
      }
    }

}

export default SupabaseService


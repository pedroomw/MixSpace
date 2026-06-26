import DatabaseRepository from '../repositories/SB-database-repository.js';
import StorageRepository from '../repositories/SB-storage-repository.js'

import setRandomFilename from '../helpers/files.js';
import {VersionMetadata, VersionFile} from "../entities/supabase.js";

class SupabaseService {

    uploadVersion = async (metadata, file) => {
      try{
        const {objMetadata, objFile} = this.setMetadataAndFileObjects(metadata, file)
        const resultadoDatabase = await this.uploadVersionMetadata(objMetadata)
        const resultadoStorage = await this.uploadVersionFile(objFile)
        return resultadoDatabase
      }
      catch(error){
        throw error
      }
    }

    uploadVersionMetadata = async (metadata) => {
      try{
        this.verifyVersionMetadata(metadata)
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
        this.verifyVersionFile(file)
        const repo = new StorageRepository
        const resultado = await repo.uploadFile(file)
        return resultado
      }
      catch(error){
        throw error
      }
    }



    setMetadataAndFileObjects = (metadata, file) => {
      const filename = setRandomFilename(file.originalname)
      const fileBuffer = file.buffer
      const fileMimeType = file.mimetype
      const metadataObject = new VersionMetadata(filename, body.description, body.project_id)
      const fileObject = new VersionFile(filename, fileBuffer, fileMimeType)
      return{metadataObject, fileObject}
    }

    verifyVersionFile = (file) => {
      console.log("Procesando" + file.filename)
    }
    
    verifyVersionMetadata = (metadata) => {
      console.log("Procesando" + metadata.)
    }

}

export default SupabaseService


import Version from '../entities/supabase.js'
import SupabaseRepository from '../repositories/SB-database-repository.js';


class SupabaseService {
    uploadVersion = async (metadata, file) = {
      try{
        uploadVersionMetadata(metadata)
      }
    }



    uploadVersionMetadata = async (metadata) => {
      try{
        verifyVersionMetadaa(metadata)
        const repo = new SupabaseRepository
        const resultado = repo.uploadVersion(version)
      }
      catch(error){ 
        throw (error)
      } 
    }

    uploadVersionFile = async (file)
}

export default SupabaseService


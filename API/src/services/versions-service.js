import Version from '../entities/supabase.js'
import SupabaseRepository from '../repositories/supabase-repository.js';


class SupabaseService {
    uploadVersion = async (version) => {

      if(!verifyVersion(version))
      {
        console.log("El archivo enviado no corresponde con el formato de un archivo de Versión")
        return
      }

      try{
        const repo = new SupabaseRepository
        const resultado = repo.uploadVersion(version)
      }
      catch(error){ 
        throw (error)
      } 
    }
}

export default SupabaseService


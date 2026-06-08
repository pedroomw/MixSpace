import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
} 

const supabase = createClient(supabaseUrl, supabaseKey) 


class SupabaseService {
    uploadMetadata = async (filename, description, projectID) => {
      try{
        const{data, error} = await supabase
          .from('Versions')
          .insert([{filename: filename, description: description, project_id: projectID}])
          .select()
        if(error) { 
          return { status:500, result: error};
        } else {
          return {status: 201, result: data};
        }
      }
      catch(error){ 
        return {status:500, result: "falla en el catch"} 
      } 
    }
}

export default SupabaseService


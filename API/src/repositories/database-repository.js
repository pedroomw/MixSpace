import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
} 
const supabase = createClient(supabaseUrl, supabaseKey) 

class DatabaseRepository {
    uploadVersion = async (version) => {
      try{
        const result = await supabase
          .from('Versions')
          .insert([{version}])
          .select()
          .throwOnError()
        return result
      }
      catch(error){
        throw (error)
      }
    }
}

export default DatabaseRepository
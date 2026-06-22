import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
} 
const supabase = createClient(supabaseUrl, supabaseKey) 

class StorageRepository {
    uploadFile = async (file) => {
        try{
            const {data, error} = await supabase.storage.from('versions').upload(file.filename, file.fileBuffer, {cacheControl: '3600', upsert: false, contentType: file.mimetype})
            if(error){
                throw error
            } else {
                return data
            }
        }
        catch(error){
            throw (error)
        }
    }
}

export default StorageRepository
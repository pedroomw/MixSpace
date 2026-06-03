import { createClient } from '@supabase/supabase-js'
import { error } from 'console'
import dotenv from 'dotenv'
dotenv.config({path: "./src/.env"})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadMetadata({ filename, description, projectID }) {
  const{data, error} = await supabase
    .from('Versions')
    .insert([{filename: filename, description: description, project_id: projectID}])
    .select()
}

if(error) console.error('Error:' + error)
else console.log('Metadata subida. Resultado:' + data)

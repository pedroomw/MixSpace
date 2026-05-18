import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({path: 'C:\\Users\\48793643\\MixSpace\\API\\.env'})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY 

console.log('SUPABASE_URL=', process.env.SUPABASE_URL)
console.log('SUPABASE_SERVICE_KEY=', process.env.SUPABASE_SERVICE_KEY)
console.log('SUPABASE_ANON_KEY=', process.env.SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadFile({ bucket = 'uploads', filePath, fileBuffer, contentType }) {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, { contentType, upsert: true })
  if (error) throw error

  // Try to build a public URL (works if bucket/public and public access enabled)
  try {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return { data, publicURL: urlData?.publicUrl || null }
  } catch (e) {
    return { data, publicURL: null }
  }
}

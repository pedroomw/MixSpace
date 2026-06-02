import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({path: "./src/.env"})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in environment')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadFile({ bucket, filePath, fileBuffer, contentType }) {
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

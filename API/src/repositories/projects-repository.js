import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment')
}
const supabase = createClient(supabaseUrl, supabaseKey)

class ProjectsRepository {
    GetProjectsByUserID = async (userID) => {
        try {
            const { data, error } = await supabase
                .from('Projects')
                .select('*')
                .eq('user_id', userID)
                .order('created_at', { ascending: false })
                .throwOnError()
            if(error) {
                throw error
            }
            return data
        } catch (error) {
            console.log("El error es: " + error)
            throw error
        }
    }

    CreateProject = async (userID, name, description, tags = []) => {
        try {
            const { data, error } = await supabase
                .from('Projects')
                .insert([{ name, description, user_id: userID, tags, public: false }])
                .select()
                .single()
                .throwOnError()
            if (error) throw error
            return data
        } catch (error) {
            console.log("El error es: " + error)
            throw error
        }
    }

    SetProjectVisibility = async (projectID, userID, isPublic) => {
        try {
            const { data, error } = await supabase
                .from('Projects')
                .update({ public: isPublic })
                .eq('id', projectID)
                .eq('user_id', userID) // ensure ownership
                .select()
                .single()
                .throwOnError()
            if (error) throw error
            return data
        } catch (error) {
            console.log("El error es: " + error)
            throw error
        }
    }
}

export default ProjectsRepository
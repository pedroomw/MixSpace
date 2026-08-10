import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment')
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)

class AuthRepository {
    signUp = async (email, password) => {
        const { data, error } = await supabaseAuth.auth.signUp({ email, password })
        if (error) throw error
        const { data: profileData, error: profileError } = await supabaseAuth.from("Users").insert({ id: data.user.id, email: email, password: password }).select()
        if(profileError) { throw profileError}
        return profileData
    }

    signIn = async (email, password) => {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data.user
    }

    getUserFromToken = async (token) => {
        const { data, error } = await supabaseAuth.auth.getUser(token)
        if (error) throw error
        return data.user
    }
}

export default AuthRepository
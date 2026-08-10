import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and supabaseServiceRoleKey must be set in environment')
}

const supabaseAuth = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

class AuthRepository {
signUp = async (email, password) => {
    const { data, error } = await supabaseAuth.auth.signUp({ email, password })
    console.log('signUp data:', JSON.stringify(data))
    console.log('signUp error:', error)
    if (error) throw error

    const { data: profileData, error: profileError } = await supabaseAuth
        .from("Users")
        .insert({ id: data.user.id, email: email })
        .select()
    console.log('insert profileData:', profileData)
    console.log('insert profileError:', profileError)
    if (profileError) { throw profileError }
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
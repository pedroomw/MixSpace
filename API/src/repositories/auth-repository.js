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
    signUp = async (email, password, country, username) => {
        const { data, error } = await supabaseAuth.auth.signUp({ email, password })
        console.log('signUp data:', JSON.stringify(data))
        console.log('signUp error:', error)
        if (error) throw error

        const { data: profileData, error: profileError } = await supabaseAuth
            .from("Users")
            .insert({ id: data.user.id, email: email, country: country, username: username })
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

        getUserFromID = async (id) => {
            const { data, error } = await supabaseAuth.from('Users').select('id, email, created_at').eq('id', id).single()
            if (error) throw error
            return data
        }

        saveRefreshToken = async (userId, refreshToken) => {
            const { error } = await supabaseAuth
                .from('Users')
                .update({ refresh_token: refreshToken })
                .eq('id', userId)
            if (error) throw error
        }

        getRefreshToken = async (userId) => {
            const { data, error } = await supabaseAuth
                .from('Users')
                .select('refresh_token')
                .eq('id', userId)
                .single()
            if (error) throw error
            return data?.refresh_token ?? null
        }

        deleteRefreshToken = async (userId) => {
            const { error } = await supabaseAuth
                .from('Users')
                .update({ refresh_token: null })
                .eq('id', userId)
            if (error) throw error
        }
}

export default AuthRepository
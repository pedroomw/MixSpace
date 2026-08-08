import AuthRepository from '../repositories/auth-repository.js'

const authRepository = new AuthRepository()

class AuthService {
    register = async (email, password) => {
        const data = await authRepository.signUp(email, password)
        return {
            user: data.user,
            session: data.session
        }
    }

    login = async (email, password) => {
        const user = await authRepository.signIn(email, password)
        return user
    }
}

export default AuthService
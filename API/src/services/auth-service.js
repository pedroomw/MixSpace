import AuthRepository from '../repositories/auth-repository.js'
import jwt from 'jsonwebtoken'

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
        const token = jwt.sign(
        { userId: user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
        );
        return token
    }

    getUserFromToken = async(userID) => {
        const user = await AuthRepository.getUserByID(userID)
        return user
    }

    getMyUser = async (userID) => {
        const user = await authRepository.getUserFromID(userID)
        return user
    }
}

export default AuthService
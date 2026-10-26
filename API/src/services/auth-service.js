import AuthRepository from '../repositories/auth-repository.js'
import jwt from 'jsonwebtoken'

const authRepository = new AuthRepository()

class AuthService {
    register = async (email, password, country, username) => {
        const data = await authRepository.signUp(email, password, country, username)
        return {
            user: data.user,
            session: data.session
        }
    }

    login = async (email, password) => {
        const user = await authRepository.signIn(email, password)

        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        // Persist the refresh token so we can validate it later
        await authRepository.saveRefreshToken(user.id, refreshToken)

        return { access_token: accessToken, refresh_token: refreshToken }
    }

    /**
     * Validate a refresh token and issue a new access token + rotated refresh token.
     * @param {string} refreshToken
     * @returns {{ access_token: string, refresh_token: string }}
     */
    refresh = async (refreshToken) => {
        if (!refreshToken) throw new Error('Refresh token requerido')

        let payload
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        } catch {
            throw new Error('Refresh token inválido o expirado')
        }

        const userId = payload.userId

        // Check the stored token matches (prevents reuse after logout)
        const stored = await authRepository.getRefreshToken(userId)
        if (!stored || stored !== refreshToken) {
            throw new Error('Refresh token inválido o ya utilizado')
        }

        // Rotate: generate new pair
        const newAccessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        const newRefreshToken = jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        await authRepository.saveRefreshToken(userId, newRefreshToken)

        return { access_token: newAccessToken, refresh_token: newRefreshToken }
    }

    /**
     * Invalidate the refresh token on logout.
     * @param {string} userId
     */
    logout = async (userId) => {
        await authRepository.deleteRefreshToken(userId)
    }

    getMyUser = async (userID) => {
        const user = await authRepository.getUserFromID(userID)
        return user
    }
}

export default AuthService

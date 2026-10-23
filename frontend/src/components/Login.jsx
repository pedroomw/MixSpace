import { useState } from 'react'
import { loginUser, registerUser } from '../api/auth'
import { setTokens, setUser } from '../services/tokenStore'
import logoImg from '../../imagenes/Logo mixspace fucsia.jfif'

function Login({ onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = isRegistering
                ? await registerUser(email, password)
                : await loginUser(email, password)

            if (isRegistering) {
                if (data.session) {
                    const user = { ...data.user, email: data.user.email || email }
                    setTokens(data.session.access_token, data.session.refresh_token)
                    setUser(user)
                    onLoginSuccess(user)
                } else {
                    setError('Registro exitoso. Revisá tu email para confirmar la cuenta.')
                }
            } else {
                // Login may return a bare JWT string or an object with tokens
                const accessToken  = data?.access_token  ?? data
                const refreshToken = data?.refresh_token ?? null

                // Decode the email from the JWT payload (it's not a secret)
                let username = email
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]))
                    if (payload.email) username = payload.email
                } catch (_) { /* use raw email as fallback */ }

                const user = { email: username }
                setTokens(accessToken, refreshToken)
                setUser(user)
                onLoginSuccess(user)
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Ocurrió un error, intentá de nuevo'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <img src={logoImg} alt="MixSpace" className="login-logo-img" />
                </div>
                <h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="login-error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : (isRegistering ? 'Registrarme' : 'Ingresar')}
                    </button>
                </form>

                <p className="login-switch">
                    {isRegistering ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
                    <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Iniciar sesión' : 'Registrarme'}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login

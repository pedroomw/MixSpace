import { useState } from 'react'
import { loginUser } from '../api/auth'
import { setTokens, setUser } from '../services/tokenStore'
import logoImg from '../../imagenes/Logo mixspace fucsia.jfif'

/**
 * LoginForm — formulario de inicio de sesión independiente.
 *
 * Props:
 *   onLoginSuccess(user)  — callback cuando el login es exitoso
 *   onSwitchToRegister()  — callback para navegar al formulario de registro
 */
function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginUser(email, password)

            // El backend puede devolver el JWT como string plano o como objeto
            const accessToken  = data?.access_token  ?? data
            const refreshToken = data?.refresh_token ?? null

            // Decodificar el email desde el payload JWT (no es secreto)
            let username = email
            try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]))
                if (payload.email) username = payload.email
            } catch (_) { /* fallback al email ingresado */ }

            const user = { email: username }
            setTokens(accessToken, refreshToken)
            setUser(user)
            onLoginSuccess(user)
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
                <h2>Iniciar sesión</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    {error && <p className="login-error" role="alert">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="login-switch">
                    ¿No tenés cuenta?{' '}
                    <button type="button" onClick={onSwitchToRegister}>
                        Registrarme
                    </button>
                </p>
            </div>
        </div>
    )
}

export default LoginForm

import { useState } from 'react'
import { loginUser, registerUser } from '../api/auth'

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
                    localStorage.setItem('mixspace_token', data.session.access_token)
                    localStorage.setItem('mixspace_user', JSON.stringify(user))
                    onLoginSuccess(user)
                } else {
                    setError('Registro exitoso. Revisá tu email para confirmar la cuenta.')
                }
            } else {
                // Login returns a bare JWT string
                const token = data
                // Decode the email from the JWT payload (it's not a secret)
                let username = email
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    if (payload.email) username = payload.email
                } catch (_) { /* use raw email as fallback */ }

                const user = { token, email: username }
                localStorage.setItem('mixspace_token', token)
                localStorage.setItem('mixspace_user', JSON.stringify(user))
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
                    <svg width="36" height="26" viewBox="0 0 46 32" fill="none">
                        <rect x="0"  y="8"  width="5" height="16" rx="2.5" fill="#c084fc"/>
                        <rect x="8"  y="4"  width="5" height="24" rx="2.5" fill="#c084fc"/>
                        <rect x="16" y="0"  width="5" height="32" rx="2.5" fill="#c084fc"/>
                        <rect x="24" y="6"  width="5" height="20" rx="2.5" fill="#c084fc"/>
                        <rect x="32" y="10" width="5" height="12" rx="2.5" fill="#c084fc"/>
                    </svg>
                    <h1>MixSpace</h1>
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

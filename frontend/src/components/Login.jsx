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

            if (data.session) {
                localStorage.setItem('mixspace_token', data.session.access_token)
                localStorage.setItem('mixspace_user', JSON.stringify(data.user))
                onLoginSuccess(data.user)
            } else if (isRegistering) {
                setError('Registro exitoso. Revisá tu email para confirmar la cuenta.')
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
                <h1>MixSpace</h1>
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
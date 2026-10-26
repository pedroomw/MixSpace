import { useState } from 'react'
import { registerUser } from '../api/auth'
import { setTokens, setUser } from '../services/tokenStore'
import logoImg from '../../imagenes/Logo mixspace fucsia.jfif'

/**
 * RegisterForm — formulario de creación de cuenta independiente.
 *
 * Props:
 *   onLoginSuccess(user)  — callback cuando el registro + login automático son exitosos
 *   onSwitchToLogin()     — callback para volver al formulario de login
 *
 * Nota: el formulario acepta email + contraseña por defecto.
 * Si necesitás agregar campos adicionales (nombre, username, etc.)
 * solo tenés que sumarlos acá sin afectar LoginForm.
 */
function RegisterForm({ onLoginSuccess, onSwitchToLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verifyPassword, setVerifyPassword] = useState('')
    const [country, setCountry] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if(password == verifyPassword) {
             try {
            const data = await registerUser(email, password, country, username)

            if (data.session) {
                // El backend devolvió sesión directa (ej. Supabase sin confirmación de email)
                const user = { ...data.user, email: data.user?.email || email }
                setTokens(data.session.access_token, data.session.refresh_token)
                setUser(user)
                onLoginSuccess(user)
            } else {
                // Flujo con confirmación por email
                setError('Registro exitoso. Revisá tu email para confirmar la cuenta.')
            }
        } catch (err) {
            const message = err.response?.data?.error || 'Ocurrió un error, intentá de nuevo'
            setError(message)
        } finally {
            setLoading(false)
        }
    } else {
         const message = 'Las contraseñas deben coincidir'
         setError(message)
    }
        }
    

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <img src={logoImg} alt="MixSpace" className="login-logo-img" />
                </div>
                <h2>Crear cuenta</h2>

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
                    />
                    <input
                        type="password"
                        placeholder="Verificar Contraseña"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Tu país"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    {error && <p className="login-error" role="alert">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Registrarme'}
                    </button>
                </form>

                <p className="login-switch">
                    ¿Ya tenés cuenta?{' '}
                    <button type="button" onClick={onSwitchToLogin}>
                        Iniciar sesión
                    </button>
                </p>
            </div>
        </div>
    )
}

export default RegisterForm

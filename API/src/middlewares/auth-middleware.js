import jwt from 'jsonwebtoken'

const verificarAutenticacion = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            error: true,
            mensaje: 'Acceso denegado. No se proporcionó un token.'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(403).json({
                error: true,
                mensaje: 'Token inválido o expirado.'
            })
        }

        req.user = usuarioDecodificado
        next()
    })
}

export default verificarAutenticacion
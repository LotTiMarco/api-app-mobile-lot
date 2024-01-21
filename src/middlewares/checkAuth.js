import jwt from 'jsonwebtoken';
const { verify: verifyToken } = jwt;
const secretKey = process.env.AAML_JWT_SECRET_KEY;

// Middleware para manejar la autorización
export const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Token no válido.', code: 'authentication_failed' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token y obtener la información encriptada
    verifyToken(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(401).json({ status: 'error', message: 'Token no válido.', code: 'authentication_failed' });
        } else {
            req.userId = decoded.userId;
            req.userRole = decoded.userRole;
            next();
        }
    });
};
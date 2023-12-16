const jwt = require('jsonwebtoken');

// Secret key para firmar y verificar el token
const secretKey = '26c48966bdb145ca2972928f3d9eccc0a1097e51856391c3eac570e68391269b';

// Información a ser encriptada en el token
const payload = {
    userId: 123,
    userRole: 'admin',
};

// Crear un token con la información encriptada
const token = jwt.sign(payload, secretKey, { noTimestamp: true });

console.log('Token:', token);

// Verificar el token y obtener la información encriptada
jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        console.error('Error al verificar el token:', err);
    } else {
        console.log('Información desencriptada:', decoded);
    }
});
const express = require('express');
const app = express();
const PORT = 3003;

// Simulación de datos de usuarios
const usuarios = [
    { id: 1, email: 'usuario1@example.com', password: 'password1', accessToken: 'abc123', userId: '1a', userRole: 'admin' },
    { id: 2, email: 'usuario2@example.com', password: 'password2', accessToken: 'abc234', userId: '2a', userRole: 'customer' },
    // Agregar más usuarios si es necesario
];
// Simulación de datos de empresas
const empresas = [
    { userId: '2a', companyName: 'Empresa Ejemplo', ruc: '12345678901', address: 'Dirección Ejemplo', legalRepresentative: 'Representante Ejemplo', email: 'empresa@example.com', phone: '123456789', country: 'País Ejemplo', logo: 'https://d500.epimg.net/cincodias/imagenes/2015/05/08/pyme/1431098283_691735_1431098420_noticia_normal.jpg' },
    // Agregar más empresas si es necesario
];
// Simulación de datos de años
const years = ['2021', '2022', '2023'];
// Simulación de datos de archivos por año
const files = ['file1', 'file2', 'file3'];
// Simulación de datos de certificaciones
const certificationData = {
    quotes: [{ name: 'Cotización 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    contractsBillings: [
        { name: 'Contrato 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' },
        { name: 'Facturación 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }
    ],
    auditPlans: [{ name: 'Plan de auditoría 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    auditReports: [{ name: 'Reporte de auditoría 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    certificates: [{ name: 'Certificado 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }]
};
// Simulación de datos de seguimiento de certificaciones
const certificationMonitoringData = {
    monitoringPlans: [{ name: 'Plan de seguimiento 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    monitoringReports: [{ name: 'Reporte de seguimiento 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }]
};
// Simulación de datos de recertificaciones
const recertificationData = {
    quotes: [{ name: 'Cotización 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    contractsBillings: [
        { name: 'Contrato 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' },
        { name: 'Facturación 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }
    ],
    recertificationPlans: [{ name: 'Plan de Recertificación 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    recertificationReports: [{ name: 'Reporte de Recertificación 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    certificates: [{ name: 'Certificado 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }]
};
// Simulación de datos de seguimiento de recertificaciones
const recertificationMonitoringData = {
    monitoringPlans: [{ name: 'Plan de seguimiento 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }],
    monitoringReports: [{ name: 'Reporte de seguimiento 1', url: 'https://www.lotinternacional.com/cms/instructivos/uso_instructivo_app_lot_internacional.pdf' }]
};


// Middleware para manejar la autorización
const TESTcheckAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Token no válido.', code: 'authentication_failed' });
    }

    const token = authHeader.split(' ')[1];
    const usuario = usuarios.find(user => user.accessToken === token);

    if (!usuario) {
        return res.status(401).json({ status: 'error', message: 'Token no válido.', code: 'authentication_failed' });
    }

    req.usuario = usuario;
    next();
};
// Middleware para verificar la existencia de userId, year y fileNumber
const TESTcheckParamsExistence = (req, res, next) => {
    const { userId, year, fileNumber } = req.params;

    if (userId === undefined || year === undefined || fileNumber === undefined) {
        return res.status(404).json({ status: 'error', message: 'Recurso no encontrado.', code: 'resource_not_found' });
    }

    const userExists = usuarios.some(user => user.userId === userId);
    const yearExists = years.includes(year);
    const fileExists = files.includes(fileNumber);

    if (!userExists || !yearExists || !fileExists) {
        return res.status(404).json({ status: 'error', message: 'Recurso no encontrado.', code: 'resource_not_found' });
    }

    next();
};

// Endpoint raiz
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: "BIENVENIDO AL BACKEND" });
})

// Endpoint para iniciar sesión
app.post('/login', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ status: 'error', message: 'Usuario o contraseña inválida.', code: 'authentication_failed' });
    }

    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    const usuario = usuarios.find(user => user.email === email && user.password === password);

    if (!usuario) {
        return res.status(401).json({ status: 'error', message: 'Usuario o contraseña inválida.', code: 'authentication_failed' });
    }

    const { accessToken, userId, userRole } = usuario;
    res.status(201).json({ status: 'success', data: { accessToken, userId, userRole } });
});

// Endpoint para obtener datos de empresa
app.get('/api.customers/:userId/profile', TESTcheckAuth, (req, res) => {
    const { userId } = req.params;
    const empresa = empresas.find(emp => emp.userId === userId);

    if (!empresa) {
        return res.status(404).json({ status: 'error', message: 'Recurso no encontrado.', code: 'resource_not_found' });
    }

    res.status(200).json({ status: 'success', data: empresa });
});

// Endpoint para actualizar datos de empresa
app.post('/api.customers/:userId/profile', TESTcheckAuth, express.json(), (req, res) => {
    const { userId } = req.params;
    const empresa = empresas.find(emp => emp.userId === userId);

    if (!empresa) {
        return res.status(404).json({ status: 'error', message: 'Recurso no encontrado.', code: 'resource_not_found' });
    }

    const { address, phone, country, logo } = req.body.update;
    // Actualizar los datos de la empresa en la "base de datos"
    empresa.address = address || empresa.address;
    empresa.phone = phone || empresa.phone;
    empresa.country = country || empresa.country;
    empresa.logo = logo || empresa.logo;

    res.status(204).send();
});

// Endpoint para obtener años de documentos
app.get('/api.documents/:userId/years', TESTcheckAuth, (req, res) => {
    res.status(200).json({ status: 'success', data: { years } });
});

// Endpoint para obtener archivos por año
app.get('/api.documents/:userId/:year/files', TESTcheckAuth, (req, res) => {
    res.status(200).json({ status: 'success', data: { files } });
});

// Endpoint para obtener certificaciones por archivo
app.get('/api.documents/:userId/:year/:fileNumber/certification', TESTcheckAuth, TESTcheckParamsExistence, (req, res) => {
    res.status(200).json({ status: 'success', data: certificationData });
});

// Endpoint para obtener seguimiento de certificaciones por archivo
app.get('/api.documents/:userId/:year/:fileNumber/certification/monitoring', TESTcheckAuth, TESTcheckParamsExistence, (req, res) => {
    res.status(200).json({ status: 'success', data: certificationMonitoringData });
});

// Endpoint para obtener recertificaciones por archivo
app.get('/api.documents/:userId/:year/:fileNumber/recertification', TESTcheckAuth, TESTcheckParamsExistence, (req, res) => {
    res.status(200).json({ status: 'success', data: recertificationData });
});

// Endpoint para obtener seguimiento de recertificaciones por archivo
app.get('/api.documents/:userId/:year/:fileNumber/recertification/monitoring', TESTcheckAuth, TESTcheckParamsExistence, (req, res) => {
    res.status(200).json({ status: 'success', data: recertificationMonitoringData });
});


// Iniciar escucha del api
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});

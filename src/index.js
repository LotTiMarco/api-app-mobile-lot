import 'dotenv/config';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import config from './config.js';

import apiAuth from './routes/api.auth/index.js';
import apiCustomers from "./routes/api.customers/index.js";
import apiDocuments from "./routes/api.documents/index.js";
import apiNotifications from "./routes/api.notifications/index.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Settings
app.set('port', process.env.PORT || 5000);

app.use(express.urlencoded({ extended: false }));
app.use(cors(config.application.cors.server));
app.use('/uploads', express.static('uploads')); // Ruta relativa, requiere iniciar el servidor desde la raiz del proyecto
console.log(path.join(__dirname, 'uploads'));
app.use(express.json());

// Endpoint raiz
app.get('/', async (req, res) => {
    return res.status(200).json({ status: 'success', message: "BIENVENIDO AL BACKEND" });
})

// Routes
app.use('/api.auth', apiAuth);
app.use('/api.customers', apiCustomers);
app.use('/api.documents', apiDocuments);
app.use('/api.notifications', apiNotifications);

app.use((err, req, res, next) => {
    console.error(err.detail, err.message);
    return res.status(500).json({ status: "error", message: `Hubo un problema en el servidor: ${err.message}`, code: "internal_server_error" });
});

// Starting the server
app.listen(app.get('port'), () => console.log(`Server on port ${process.env.PORT}`));

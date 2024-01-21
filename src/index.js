import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import config from './config.js';

import swaggerUi from 'swagger-ui-express';

import apiAuth from './routes/api.auth/index.js';
import apiCustomers from "./routes/api.customers/index.js";
import apiAuditors from "./routes/api.auditors/index.js";
import apiCommercials from "./routes/api.commercials/index.js";
import apiUsers from "./routes/api.users/index.js";
import apiDocuments from "./routes/api.documents/index.js";
import apiNotifications from "./routes/api.notifications/index.js";
import apiServices from "./routes/api.services/index.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Settings
app.set('port', process.env.AAML_PORT || 25000);

app.use(express.urlencoded({ extended: false }));
app.use(cors(config.application.cors.server));
app.use(express.json());

// Endpoint root
app.get('/', async (req, res) => {
    return res.status(200).json({ status: 'success', message: "BIENVENIDO AL BACKEND" });
})

// Routes
app.use('/api.auth', apiAuth);
app.use('/api.customers', apiCustomers);
app.use('/api.auditors', apiAuditors);
app.use('/api.commercials', apiCommercials);
app.use('/api.users', apiUsers);
app.use('/api.documents', apiDocuments);
app.use('/api.notifications', apiNotifications);
app.use('/api.services', apiServices);

// Static files
app.use('/uploads', express.static('uploads')); // Ruta relativa, requiere iniciar el servidor desde la raiz del proyecto
console.log(path.join(__dirname, 'uploads'));

// Swagger

app.get("/docs/swagger.json", async (req, res) => {
    try {
        const swaggerDocument = JSON.parse(
            await readFile(
                new URL('./../docs/swagger.json', import.meta.url)
            )
        );
        swaggerDocument.host = req.get('host');
        res.json(swaggerDocument)
    } catch (error) {
        return res.status(500).json({ status: "error", message: `Hubo un problema en el servidor: ${error.message}`, code: "internal_server_error" });
    }
});

// SWAGGER UI
const options = {
    swaggerOptions: {
        url: "/docs/swagger.json",
    },
}
app.use('/docs', swaggerUi.serveFiles(null, options), swaggerUi.setup(null, options));

// RAPIDOC
app.get('/v2/docs', (req, res) => {
    const swaggerRapidoc = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
    </head>
    <body>
      <rapi-doc
        spec-url="${process.env.AAML_WEBSITE_PROTOCOL}://${process.env.AAML_WEBSITE_HOSTNAME}/docs/swagger.json"
        render-style = "read"
        show-header = 'false'
        style = "height:100vh; width:100%"
      > </rapi-doc>
    </body>
    </html>
    `
    res.send(swaggerRapidoc);
})
app.use((err, req, res, next) => {
    console.error(err.detail, err.message);
    return res.status(500).json({ status: "error", message: `Hubo un problema en el servidor: ${err.message}`, code: "internal_server_error" });
});

// Starting the server
app.listen(app.get('port'), () => console.log(`Server on port ${process.env.AAML_PORT}`));

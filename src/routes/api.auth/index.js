import { Router } from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import { createJWT } from "../../functions/createJWT.js";
import bcrypt from 'bcrypt';

const router = Router();
const repository = new RepositoryPostgre();

router.get('/', async (req, res, next) => {
    /*
    #swagger.tags = ['Seguridad']
    #swagger.operationId = 'api.auth/'
    #swagger.summary = 'Endpoint raíz para seguridad'
    #swagger.description = 'Endpoint root for security'
    #swagger.responses[200] = {
        status: 'success',
        message: 'API PARA AUTENTICACION'
    }
    #swagger.deprecated = false
    #swagger.ignore = true
    */
    try {
        return res.status(200).json({ status: 'success', message: "API PARA AUTENTICACION" });
    } catch (error) {
        next(error);
    }
});


router.post('/login', async (req, res, next) => {
    /*
    #swagger.tags = ['Seguridad']
    #swagger.operationId = 'api.auth/login'
    #swagger.summary = 'Endpoint para login'
    #swagger.description = 'Endpoint para obtener id de usuario, rol y token de acceso.'
    #swagger.security = [{
        "basicAuth": []
    }]
    #swagger.responses[200] = {
        schema:{
            $ref: "#/components/responses/LoginResponse"
        },
        example: {
        status: "success",
            data: {
                userId: "...",
                userRole: "...",
                accessToken: "..."
            }
        }
    }
    #swagger.responses[401] = {
        schema: { $ref: "#/components/responses/UnauthorizedError" },
    }
    #swagger.responses[500] = {
        schema: { $ref: "#/components/responses/InternalServerError" },
    }
    #swagger.deprecated = false
    #swagger.ignore = false
    */
    try {
        await repository.connect();
        //decode base64
        const auth = req.headers['authorization'];
        const base64Credentials = auth.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');

        const { rows } = await repository.query(
            `SELECT "userId", "userRole", password FROM users WHERE email = $1;`,
            [email]
        );

        if (rows.length > 0) {
            const storedPassword = rows[0].password;
            if (await bcrypt.compare(password, storedPassword)) {
                const payload = {
                    userId: rows[0].userId,
                    userRole: rows[0].userRole,
                };

                payload.accessToken = createJWT(payload); // bearer token

                return res.status(200).json({ status: 'success', data: payload });
            } else {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario o contraseña inválida.',
                    code: 'authentication_failed',
                });
            }
        } else {
            return res.status(401).json({ status: 'error', message: 'Usuario o contraseña invalida.', code: 'authentication_failed' });
        }
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
    } finally {
        await repository.disconnect();
    }
});

export default router;
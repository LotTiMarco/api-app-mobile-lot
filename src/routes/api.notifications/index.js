import { Router} from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import {checkAuth} from "../../middlewares/checkAuth.js";
import {validateURLParams} from "../../middlewares/validateURLParams.js";
import {allowRoles} from "../../middlewares/allowRoles.js";
import FCMIntegration from "../../Services/FCM.integration.js";

const router = Router();
const repositoryDB = new RepositoryPostgre();
const notificationManager = new FCMIntegration();

router.get('/', async (req, res, next) => {
    /*
    #swagger.tags = ['Notifications']
    #swagger.ignore = true
     */
    try {
        return res.status(200).json({ status: 'success', message: "API PARA NOTIFICACIONES" });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/send',
    checkAuth,
    allowRoles(['admin', 'customer', 'auditor', 'commercial']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Notifications']
        #swagger.ignore = true
         */
        try {
            await notificationManager.configure();
            await repositoryDB.connect()

            const { rows: devices} = await repositoryDB.query(
                `SELECT "tokenDevice" FROM "loginDevices" WHERE "userEmail" = $1;`,
                [req.body.email]
            )

            if (devices.length <= 0) return res.status(404).json({ status: 'error', message: 'Dispositivo no encontrado.', code: 'devices_not_found' });

            console.log(devices)

            devices.map(async(device) => {
                // message = {notification: {title,body}}
                await notificationManager.sendNotification(device.tokenDevice, {notification: JSON.parse(req.body.notification)});
            })

            return res.status(200).json({ status: 'success', data: devices });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.post(
    '/subscribe/:tokenDevice',
    validateURLParams('tokenDevice'),
    checkAuth,
    allowRoles(['admin', 'customer', 'auditor', 'commercial']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Notifications']
        #swagger.operationId = 'api.notifications/subscribe'
        #swagger.summary = 'Endpoint para suscribir un dispositivo.'
        #swagger.description = 'Endpoint para suscribir un dispositivo, vinculado al usuario gracias al payload del accessToken.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['tokenDevice'] = {
            in: 'path',
            description: 'Token del dispositivo.',
            required: true,
            type: 'string'
        }
        #swagger.responses[204] = {
        }
        #swagger.responses[400] = {
            schema:{
                $ref: "#/components/responses/BadRequestError"
            }
        }
        #swagger.responses[401] = {
            schema:{
                $ref: "#/components/responses/UnauthorizedError"
            }
        }
        #swagger.responses[404] = {
            schema:{
                $ref: "#/components/responses/NotFoundError"
            }
        }
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        try {
            await repositoryDB.connect()
            const { rows: users } = await repositoryDB.query(
                `SELECT email FROM companies WHERE "userId" = $1 
                UNION 
                SELECT email FROM persons WHERE "userId" = $1;`,
                [req.userId]
            );

            if (users.length <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Fallo relacionado al usuario.',
                    code: 'transaction_failed'
                })
            }

            const user = users[0]

            const { rows: devices } = await repositoryDB.query(
                `INSERT INTO "loginDevices" ("tokenDevice", "userId", "userEmail") 
                VALUES ($1, $2, $3)
                ON CONFLICT ("tokenDevice")
                DO UPDATE SET "userId" = $2, "userEmail" = $3
                RETURNING *;`,
                [req.params.tokenDevice, req.userId, user.email]
            )

            return res.status(204).json({ status: 'success' })
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/unsubscribe/:tokenDevice',
    validateURLParams('tokenDevice'),
    checkAuth,
    allowRoles(['admin', 'customer', 'auditor', 'commercial']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Notifications']
        #swagger.operationId = 'api.notifications/unsubscribe'
        #swagger.summary = 'Endpoint para desuscribir un dispositivo.'
        #swagger.description = 'Endpoint para desuscribir un dispositivo, vinculado al usuario gracias al payload del accessToken.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['tokenDevice'] = {
            in: 'path',
            description: 'Token del dispositivo.',
            required: true,
            type: 'string'
        }
        #swagger.responses[204] = {
        }
        #swagger.responses[400] = {
            schema:{
                $ref: "#/components/responses/BadRequestError"
            }
        }
        #swagger.responses[401] = {
            schema:{
                $ref: "#/components/responses/UnauthorizedError"
            }
        }
        #swagger.responses[404] = {
            schema:{
                $ref: "#/components/responses/NotFoundError"
            }
        }
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `DELETE FROM "loginDevices" WHERE "tokenDevice" = $1 RETURNING *;`,
                [req.params.tokenDevice]
            );

            return res.status(204).json({ status: 'success' });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/subscriptions',
    checkAuth,
    allowRoles(['admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Notifications']
        #swagger.operationId = 'api.notifications/subscriptions'
        #swagger.summary = 'Endpoint para obtener las suscripciones.'
        #swagger.description = 'Endpoint para obtener las suscripciones.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllSubscriptionsResponse"
            }
        }
        #swagger.responses[401] = {
            schema:{
                $ref: "#/components/responses/UnauthorizedError"
            }
        }
        #swagger.responses[404] = {
            schema:{
                $ref: "#/components/responses/NotFoundError"
            }
        }
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT ld."tokenDevice", ld."userEmail", u."userRole" 
                    FROM "loginDevices" ld 
                    INNER JOIN "users" u ON ld."userId" = u."userId" ;`
            );

            if (rows.length > 0) {
                return res.status(200).json({ status: 'success', data: rows });
            }
            return res.status(404).json({ status: 'error', message: 'No se encontraron suscripciones.', code: 'subscriptions_not_found' });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

export default router;
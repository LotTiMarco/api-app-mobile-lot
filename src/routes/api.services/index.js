import { Router} from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import RepositoryServerStorageDoc from "../../repository/Repository.serverStorage.doc.js";
import RepositoryServerStorageImg from "../../repository/Repository.serverStorage.img.js";
import {checkAuth} from "../../middlewares/checkAuth.js";
import {validateURLParams} from "../../middlewares/validateURLParams.js";
import {allowRoles} from "../../middlewares/allowRoles.js";
import { upload } from "../../middlewares/multer.js";
import { sendEmail, notifyNewDoc } from "../../Services/SMTP.integration.js";

const router = Router();
const repositoryDB = new RepositoryPostgre();
const repositoryServerStorageDoc = new RepositoryServerStorageDoc();
const repositoryServerStorageImg = new RepositoryServerStorageImg();

router.get('/', async (req, res, next) => {
    /*
    #swagger.tags = ['Services']
    #swagger.ignore = true
     */
    try {
        return res.status(200).json({ status: 'success', message: "API PARA GESTIONAR SERVICIOS QUE OFRECE LOT INTERNACIONAL" });
    } catch (error) {
        next(error);
    }
});


router.get(
    '/all',
    async (req, res) => {
        /*
        #swagger.tags = ['Services']
        #swagger.operationId = 'api.services/all'
        #swagger.summary = 'Endpoint para obtener una lista de los servicios.'
        #swagger.description = 'Endpoint para obtener los servicios que ofrece LOT Internacional.'
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllServicesResponse"
            }
        }
        #swagger.responses[400] = {
            schema:{
                $ref: "#/components/responses/BadRequestError"
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

            const { rows: services } = await repositoryDB.query(
                `SELECT * FROM services;`
            );
            return res.status(200).json({ status: 'success', data: services });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/new',
    checkAuth,
    allowRoles(['commercial', 'admin']),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }
    ]),
    async (req, res) => {
        /*
         #swagger.tags = ['Services']
         #swagger.operationId = 'api.services/new'
         #swagger.summary = 'Endpoint para crear un nuevo servicio.'
         #swagger.description = 'Endpoint para crear un nuevo servicio.'
         #swagger.security = [{
            "bearerAuth": []
         }]
         #swagger.requestBody = {
             required: true,
             content: {
                 "multipart/form-data": {
                     schema: {
                        type: "object",
                        properties: {
                            title: {
                                required: true,
                                type: "string"
                            },
                            thumbnail: {
                                required: true,
                                type: "string",
                                format: "binary"
                            },
                            pdf: {
                                required: true,
                                type: "string",
                                format: "binary"
                            }
                        }
                     }
                 }
             }
         }
         #swagger.responses[204] = {
             schema:{
             $ref: "#/components/responses/NonContentResponse"
             }
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
         #swagger.responses[409] = {
            schema:{
                $ref: "#/components/responses/ConflictError"
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


            const title = req.body.title;
            const thumbnail = req.files['thumbnail'][0];
            const pathThumbnail = thumbnail.destination + '/' + thumbnail.filename;
            const pdf = req.files['pdf'][0];
            const pathPdf = pdf.destination + '/' + pdf.filename;

            const { rows: services } = await repositoryDB.query(
                `INSERT INTO "services" ("title", "thumbnailUrl", "pdfUrl") VALUES ($1, $2, $3);`,
                [title, pathThumbnail, pathPdf]
            );
            return res.status(204).json({ status: 'success'});
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.delete(
    '/:serviceId',
    validateURLParams('serviceId'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    async (req, res) => {
        /*
         #swagger.tags = ['Services']
         #swagger.operationId = 'api.services/:serviceId'
         #swagger.summary = 'Endpoint para eliminar un servicio.'
         #swagger.description = 'Endpoint para eliminar un servicio.'
         #swagger.security = [{
            "bearerAuth": []
         }]
         #swagger.parameters['serviceId'] = {
             in: 'path',
             description: 'Id de servicio',
             required: true,
             type: 'string'
         }
         #swagger.responses[204] = {
            schema:{
                $ref: "#/components/responses/NonContentResponse"
            }
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
         #swagger.responses[409] = {
            schema:{
                $ref: "#/components/responses/ConflictError"
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

            const { rows: services } = await repositoryDB.query(
                `SELECT * FROM "services" WHERE "id" = $1;`,
                [req.params.serviceId]
            );

            if (services.length > 0) {
                const service = services[0];
                await repositoryServerStorageImg._deleteImage(service.thumbnailUrl);
                await repositoryServerStorageDoc._deleteDoc(service.pdfUrl);
            }

            await repositoryDB.query(
                `DELETE FROM "services" WHERE "id" = $1;`,
                [req.params.serviceId]
            );

            return res.status(204).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

export default router;

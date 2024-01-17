import { Router} from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import {checkAuth} from "../../middlewares/checkAuth.js";
import {validateURLParams} from "../../middlewares/validateURLParams.js";
import {allowRoles} from "../../middlewares/allowRoles.js";
import upload from "../../middlewares/multer.js";

const router = Router();
const repositoryDB = new RepositoryPostgre();

router.get('/', async (req, res, next) => {
    /*
    #swagger.tags = ['Documents']
    #swagger.ignore = true
     */
    try {
        return res.status(200).json({ status: 'success', message: "API PARA DOCUMENTOS" });
    } catch (error) {
        next(error);
    }
});

router.get(
    '/years/:userId',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Documents']
        #swagger.operationId = 'api.documents/years/:userId'
        #swagger.summary = 'Endpoint para obtener los años con documentacion de un usuario.'
        #swagger.description = 'Endpoint para obtener los años con documentacion de un usuario.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['userId'] = {
            in: 'path',
            description: 'Id de usuario',
            required: true,
            type: 'string'
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllYearsResponse"
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
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT "userId", year FROM "customersYears" WHERE "userId" = $1 ORDER BY year DESC;`,
                [req.params.userId]
            );

            if (rows.length > 0) {
                return res.status(200).json({ status: 'success', data: rows });
            } else {
                return res.status(404).json({ status: 'error', message: 'Datos no encontrados.', code: 'not_found' });
            }
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/years/:userId/new',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Documents']
        #swagger.operationId = 'api.documents/years/:userId/new'
        #swagger.summary = 'Endpoint para crear un nuevo año de documentacion para un usuario.'
        #swagger.description = 'Endpoint para crear un nuevo año de documentacion para un usuario.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['userId'] = {
            in: 'path',
            description: 'Id de usuario',
            required: true,
            type: 'string'
        }
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/NewYear"
                    },
                    examples: {
                        newYear: { $ref: "#/components/examples/newYear" }
                    }
                }
            }
        }
        #swagger.parameters['year'] = {
            in: 'body',
            description: 'Año',
            required: true,
            type: 'string'
        }
        #swagger.responses[201] = {
            schema:{
                $ref: "#/components/responses/CreatedResponse"
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
            const { rows: users } = await repositoryDB.query(
                `SELECT "userId" FROM users WHERE "userId" = $1 AND "userRole" = 'customer';`, // Solo se puede crear un año de documentacion para un usuario de tipo customer
                [req.params.userId]
            );

            if (users.length <= 0) {
                return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
            }

            const { rows: customerYear } = await repositoryDB.query(
                `SELECT "userId", year FROM "customersYears" WHERE "userId" = $1 AND year = $2;`,
                [req.params.userId, req.body.year]
            );
            if (customerYear.length > 0) {
                return res.status(409).json({ status: 'error', message: 'El año ya existe.', code: 'year_already_exists' });
            }

            await repositoryDB.query('BEGIN;'); // Inicia la transaccion

            const { rows: customerYearCreated } = await repositoryDB.query(
                `INSERT INTO "customersYears" ("userId", year) VALUES ($1, $2) RETURNING "customerYearId";`,
                [req.params.userId, req.body.year]
            );
            const { rows: fileCreated } = await repositoryDB.query(
                `INSERT INTO files ("customerYearId", "fileIndex") VALUES ($1, $2) RETURNING *;`,
                [customerYearCreated[0].customerYearId, 1]
            );

            await repositoryDB.query('COMMIT;'); // Finaliza la transaccion

            return res.status(201).json({ status: 'success', data: customerYearCreated[0] });

        } catch (error) {
            await repositoryDB.query('ROLLBACK;'); // Cancela la transaccion
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.get(
    '/files/:userId/:year',
    validateURLParams('userId', 'year'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Documents']
        #swagger.operationId = 'api.documents/files/:userId/:year'
        #swagger.summary = 'Endpoint para obtener los expedientes de un año de documentacion de un usuario.'
        #swagger.description = 'Endpoint para obtener los expedientes de un año de documentacion de un usuario.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['userId'] = {
            in: 'path',
            description: 'Id de usuario',
            required: true,
            type: 'string'
        }
        #swagger.parameters['year'] = {
            in: 'path',
            description: 'Año',
            required: true,
            type: 'string'
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllFilesResponse"
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
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        try {
            await repositoryDB.connect();
            const { rows: files } = await repositoryDB.query(
                `SELECT "fileId", "fileIndex" FROM files f 
                        where f."customerYearId" = (
                            select "customerYearId" from "customersYears" cy 
                            where cy."userId" = $1 AND cy."year" = $2
                        ) ORDER BY "fileIndex" ASC;`,
                [req.params.userId, req.params.year]
            );

            if (files.length > 0) {
                return res.status(200).json({ status: 'success', data: files });
            }
            return res.status(404).json({ status: 'error', message: 'Data not found.', code: 'not_found' });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/files/:userId/:year/new',
    validateURLParams('userId', 'year'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Documents']
        #swagger.operationId = 'api.documents/files/:userId/:year/new'
        #swagger.summary = 'Endpoint para crear un nuevo expediente de un año de documentacion de un usuario.'
        #swagger.description = 'Endpoint para crear un nuevo expediente de un año de documentacion de un usuario.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['userId'] = {
            in: 'path',
            description: 'Id de usuario',
            required: true,
            type: 'string'
        }
        #swagger.parameters['year'] = {
            in: 'path',
            description: 'Año',
            required: true,
            type: 'string'
        }
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/NewFile"
                    },
                    examples: {
                        newFile: { $ref: "#/components/examples/newFile" }
                    }
                }
            }
        }
        #swagger.responses[201] = {
            schema:{
                $ref: "#/components/responses/CreatedResponse"
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
            const {rows: users} = await repositoryDB.query(
                `SELECT "userId" FROM users WHERE "userId" = $1 AND "userRole" = 'customer';`, // Solo se puede crear un año de documentacion para un usuario de tipo customer
                [req.params.userId]
            );

            if (users.length <= 0) {
                return res.status(404).json({status: 'error', message: 'User not found.', code: 'user_not_found'});
            }

            // Verifica que el año exista
            const {rows: customerYear} = await repositoryDB.query(
                `SELECT "customerYearId", "userId", year FROM "customersYears" WHERE "userId" = $1 AND year = $2;`,
                [req.params.userId, req.params.year]
            );
            if (customerYear.length <= 0) {
                return res.status(404).json({status: 'error', message: 'Year not found.', code: 'year_not_found'});
            }

            // Verifica que el expediente no exista
            const {rows: file} = await repositoryDB.query(
                `SELECT "fileId" FROM files WHERE "customerYearId" = $1 AND "fileIndex" = $2;`,
                [customerYear[0].customerYearId, req.body.fileIndex]
            );
            if (file.length > 0) {
                return res.status(409).json({
                    status: 'error',
                    message: 'El expediente ya existe.',
                    code: 'file_already_exists'
                });
            }

            const {rows: fileCreated} = await repositoryDB.query(
                `INSERT INTO files ("customerYearId", "fileIndex") VALUES ($1, $2) RETURNING *;`,
                [customerYear[0].customerYearId, req.body.fileIndex]
            );

            return res.status(201).json({status: 'success', data: fileCreated[0]});
        } catch (error) {
            return res.status(500).json({status: 'error', message: error.message, code: 'internal_server_error'});
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.get(
    '/docs/:fileId/:typeProcess/:typeDoc',
    validateURLParams('fileId', 'typeProcess', 'typeDoc'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Documents']
        #swagger.operationId = 'api.documents/docs/:fileId/:typeProcess/:typeDoc'
        #swagger.summary = 'Endpoint para obtener los documentos de un tipo.'
        #swagger.description = 'Endpoint para obtener los documentos de un tipo, de un expediente, de un año de documentacion de un usuario.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['fileId'] = {
            in: 'path',
            description: 'Id de expediente',
            required: true,
            type: 'string'
        }
        #swagger.parameters['typeProcess'] = {
            in: 'path',
            description: 'Tipo de proceso',
            required: true,
            type: 'string',
             schema: {
                '@enum': ['certification', 'recertification']
             }
        }
        #swagger.parameters['typeDoc'] = {
            in: 'path',
            description: 'Tipo de documento',
            required: true,
            type: 'string',
            schema: {
                '@enum': ['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']
            }
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllDocsResponse"
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
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        const validTypeProcess = new Set(['certification', 'recertification']);
        const validTypeDoc = new Set(['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']);
        const idNameForTypeDoc = ['quoteId', 'contractBillingId', 'auditPlanId', 'auditReportId', 'recertificationPlanId', 'recertificationReportId', 'certificateId', 'monitoringPlanId', 'monitoringReportId']
        if (!validTypeProcess.has(req.params.typeProcess)) {
            return res.status(400).json({ status: 'error', message: 'El tipo de proceso no es válido.', code: 'invalid_type_process' });
        }
        if (!validTypeDoc.has(req.params.typeDoc)) {
            return res.status(400).json({ status: 'error', message: 'El tipo de documento no es válido.', code: 'invalid_type_doc' });
        }

        try {
            await repositoryDB.connect();

            const { rows: files } = await repositoryDB.query(
                `SELECT "fileId" FROM files WHERE "fileId" = $1;`,
                [req.params.fileId]
            );
            if (files.length <= 0) {
                return res.status(404).json({ status: 'error', message: 'File not found.', code: 'file_not_found' });
            }

            // Obtener la posición del tipo de documento en el conjunto
            const typeDocPosition = Array.from(validTypeDoc).indexOf(req.params.typeDoc);

            // Obtener el nombre del ID correspondiente en la lista
            const idName = idNameForTypeDoc[typeDocPosition];

            const query = `SELECT "${idName}" AS "docId", "typeProcess", "fileId", name, url, created_at FROM "${req.params.typeDoc}" t where t."fileId" = $1 and t."typeProcess" = $2;`;
            const { rows: docs } = await repositoryDB.query(
                query,
                [req.params.fileId, req.params.typeProcess]
            );

            return res.status(200).json({ status: 'success', data: docs });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/docs/:fileId/:typeProcess/:typeDoc/new',
    validateURLParams('fileId', 'typeProcess', 'typeDoc'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    upload.single('file'),
    async (req, res, next) => {
        /*
         #swagger.tags = ['Documents']
         #swagger.operationId = 'api.documents/docs/:fileId/:typeProcess/:typeDoc/new'
         #swagger.summary = 'Endpoint para crear un nuevo documento.'
         #swagger.description = 'Endpoint para crear un nuevo documento, de un tipo, de un expediente, de un año de documentacion de un usuario.'
         #swagger.security = [{
            "bearerAuth": []
         }]
         #swagger.parameters['fileId'] = {
             in: 'path',
             description: 'Id de expediente',
             required: true,
             type: 'string'
         }
         #swagger.parameters['typeProcess'] = {
             in: 'path',
             description: 'Tipo de proceso',
             required: true,
             type: 'string',
             schema: {
                 '@enum': ['certification', 'recertification']
             }
         }
         #swagger.parameters['typeDoc'] = {
             in: 'path',
             description: 'Tipo de documento',
             required: true,
             type: 'string',
             schema: {
                 '@enum': ['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']
             }
         }
         #swagger.requestBody = {
             required: true,
             content: {
                 "multipart/form-data": {
                     schema: {
                        type: "object",
                        properties: {
                            name: {
                                required: true,
                                type: "string"
                            },
                            file: {
                                required: true,
                                type: "string",
                                format: "binary"
                            }
                        }
                     }
                 }
             }
         }
         #swagger.responses[201] = {
             schema:{
             $ref: "#/components/responses/CreatedResponse"
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
        const validTypeProcess = new Set(['certification', 'recertification']);
        const validTypeDoc = new Set(['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']);
        if (!validTypeProcess.has(req.params.typeProcess)) {
            return res.status(400).json({ status: 'error', message: 'El tipo de proceso no es válido.', code: 'invalid_type_process' });
        }
        if (!validTypeDoc.has(req.params.typeDoc)) {
            return res.status(400).json({ status: 'error', message: 'El tipo de documento no es válido.', code: 'invalid_type_doc' });
        }

        try {
            await repositoryDB.connect();

            const name = req.body.name;
            const file = req.file;
            const pathFile = file.destination + '/' + file.filename;

            const { rows: files } = await repositoryDB.query(
                `SELECT "fileId" FROM files WHERE "fileId" = $1;`,
                [req.params.fileId]
            );
            if (files.length <= 0) {
                return res.status(404).json({ status: 'error', message: 'File not found.', code: 'file_not_found' });
            }

            const { rows: docs } = await repositoryDB.query(
                `INSERT INTO "${req.params.typeDoc}" ("typeProcess", "fileId", name, url) VALUES ($1, $2, $3, $4) RETURNING * ;`,
                [req.params.typeProcess, req.params.fileId, name, pathFile]
            );

            return res.status(201).json({ status: 'success', data: docs[0] });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.delete(
    '/docs/:typeDoc/:docId',
    validateURLParams('typeDoc', 'docId'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    async (req, res, next) => {
        /*
         #swagger.tags = ['Documents']
         #swagger.operationId = 'api.documents/docs/:typeDoc/:docId'
         #swagger.summary = 'Endpoint para eliminar un documento.'
         #swagger.description = 'Endpoint para eliminar un documento.'
         #swagger.security = [{
            "bearerAuth": []
         }]
         #swagger.parameters['typeDoc'] = {
             in: 'path',
             description: 'Tipo de documento',
             required: true,
             type: 'string',
             schema: {
                 '@enum': ['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']
             }
         }
         #swagger.parameters['docId'] = {
             in: 'path',
             description: 'Id de documento',
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
        const validTypeDoc = new Set(['quotes', 'contractsBillings', 'auditPlans', 'auditReports', 'recertificationPlans', 'recertificationReports', 'certificates', 'monitoringPlans', 'monitoringReports']);
        if (!validTypeDoc.has(req.params.typeDoc)) {
            return res.status(400).json({ status: 'error', message: 'El tipo de documento no es válido.', code: 'invalid_type_doc' });
        }

        try {
            await repositoryDB.connect();

            switch (req.params.typeDoc) {
                case 'quotes':
                    await repositoryDB.query('DELETE FROM quotes WHERE "quoteId" = $1;', [req.params.docId]);
                    break;
                case 'contractsBillings':
                    await repositoryDB.query('DELETE FROM "contractsBillings" WHERE "contractBillingId" = $1;', [req.params.docId]);
                    break;
                case 'auditPlans':
                    await repositoryDB.query('DELETE FROM "auditPlans" WHERE "auditPlanId" = $1;', [req.params.docId]);
                    break;
                case 'auditReports':
                    await repositoryDB.query('DELETE FROM "auditReports" WHERE "auditReportId" = $1;', [req.params.docId]);
                    break;
                case 'recertificationPlans':
                    await repositoryDB.query('DELETE FROM "recertificationPlans" WHERE "recertificationPlanId" = $1;', [req.params.docId]);
                    break;
                case 'recertificationReports':
                    await repositoryDB.query('DELETE FROM "recertificationReports" WHERE "recertificationReportId" = $1;', [req.params.docId]);
                    break;
                case 'certificates':
                    await repositoryDB.query('DELETE FROM certificates WHERE "certificateId" = $1;', [req.params.docId]);
                    break;
                case 'monitoringPlans':
                    await repositoryDB.query('DELETE FROM "monitoringPlans" WHERE "monitoringPlanId" = $1;', [req.params.docId]);
                    break;
                case 'monitoringReports':
                    await repositoryDB.query('DELETE FROM "monitoringReports" WHERE "monitoringReportId" = $1;', [req.params.docId]);
                    break;
                default:
                    break;
            }
            return res.status(204).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

export default router;

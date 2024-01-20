import { Router} from 'express';
import * as paginate from 'express-paginate'
import { v4 as uuid } from 'uuid';
import { hashPassword } from "../../functions/hashPassword.js";
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import {checkAuth} from "../../middlewares/checkAuth.js";
import {validateURLParams} from "../../middlewares/validateURLParams.js";
import {allowRoles} from "../../middlewares/allowRoles.js";
import RepositoryServerStorageImg from "../../repository/Repository.serverStorage.img.js";

const router = Router();
router.use(paginate.middleware(10, 50));

const repositoryDB = new RepositoryPostgre();
const repositoryStorageImg = new RepositoryServerStorageImg()

router.get('/', async (req, res, next) => {
    /*
    #swagger.tags = ['Usuarios']
    #swagger.ignore = true
     */
    try {
        return res.status(200).json({ status: 'success', message: "API PARA AUDITORES" });
    } catch (error) {
        next(error);
    }
});

// [GET] api.users/all
// -	Datos de todos los usuarios del sistema, con paginación
// [GET] api.users/{userRole}
// -	Datos de todos los usuarios de un rol (customer, auditor, commercial)
// [GET] api.users/{userId}
// -	Datos de un solo usuario del sistema
// [POST] api.users/{userRole}
// -	Crear un nuevo usuario (customer, auditor, commercial)
// [UPDATE] api.users/{userId}
// -	Actualizar los datos de un usuario
// [DELETE] api.users/{userId}
// -	Eliminar un usuario del sistema
// [GET] api.users/{userId}/photo
// -	Obtener la foto del perfil de un usuario
// [POST] api.users/{userId}/photo
// -	Subir una foto para el perfil de un usuario
// [UPDATE] api.users/{userId}/photo
// -	Actualizar la foto del perfil de un usuario


router.get(
    '/all',
    checkAuth,
    allowRoles(['admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/all'
        #swagger.summary = 'Endpoint para obtener todos los usuarios'
        #swagger.description = 'Endpoint para obtener todos los usuarios del sistema, con paginación.'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Número de página',
            required: false,
            type: 'integer'
        }
        #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Número de elementos por página(10 por defecto, máximo 50, limit=0 para ignorar paginación)',
            required: false,
            type: 'integer'
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllUsersResponse"
            }
        }
        #swagger.responses[401] = {
            schema:{
                $ref: "#/components/responses/UnauthorizedError"
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

            // Obtener el número de página de la consulta
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const offset = (page - 1) * limit;

            // Obtener el número total de elementos sin la limitación de paginación
            const itemCount = await repositoryDB.query(
                `SELECT COUNT(*) 
                FROM (SELECT "userId"  FROM companies
                    UNION
                    SELECT "userId"  AS name FROM persons) AS profiles;`
            );

            // Consulta con paginación
            const { rows } = await repositoryDB.query(
                `SELECT u."userRole", profiles."userId", profiles.name, profiles.identifier
                FROM(SELECT "userId", "companyName" AS name, ruc AS identifier FROM companies
                    UNION
                    SELECT "userId", "fullName" AS name, dni AS identifier FROM persons) AS profiles
                JOIN users u ON profiles."userId" = u."userId"
                LIMIT $1 OFFSET $2;`,
                [limit, offset]
            );

            const pageCount = Math.ceil(itemCount.rows[0].count / limit);

            // Devolver la respuesta con información de paginación
            return res.status(200).json({
                status: 'success',
                data: rows,
                pageCount,
                itemCount: itemCount.rows[0].count,
                pages: paginate.getArrayPages(req)(3, pageCount, page),
                has_more: paginate.hasNextPages(req)(pageCount)
            });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:role',
    validateURLParams('role'),
    checkAuth,
    allowRoles(['auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
         #swagger.tags = ['Usuarios']
         #swagger.operationId = 'api.users/{userRole}'
         #swagger.summary = 'Endpoint para obtener todos los usuarios de un rol'
         #swagger.description = 'Endpoint para obtener todos los usuarios de un rol (customer, auditor, commercial).'
         #swagger.security = [{
         "bearerAuth": []
         }]
         #swagger.parameters['role'] = {
             in: 'path',
             description: 'Rol de usuario',
             required: true,
             type: 'string'
         }
         #swagger.parameters['page'] = {
             in: 'query',
             description: 'Número de página',
             required: false,
             type: 'integer'
         }
         #swagger.parameters['limit'] = {
             in: 'query',
             description: 'Número de elementos por página(10 por defecto, máximo 50, limit=0 para ignorar paginación)',
             required: false,
             type: 'integer'
         }
         #swagger.responses[200] = {
             schema:{
                $ref: "#/components/responses/AllUsersRoleResponse"
             }
         }
         #swagger.responses[401] = {
             schema:{
                $ref: "#/components/responses/UnauthorizedError"
             }
         }
         #swagger.responses[500] = {
             schema:{
                $ref: "#/components/responses/InternalServerError"
             }
         }
         */
        const validRoles = new Set(['customer', 'auditor', 'commercial']);
        const userRole = req.params.role;

        if (!validRoles.has(userRole)) {
            return res.status(400).json({ status: 'error', message: 'El rol de usuario no es válido.', code: 'invalid_user_role' });
        }
        try {
            await repositoryDB.connect();

            // Obtener el número de página de la consulta
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const offset = (page - 1) * limit;

            const { rows: counts } = await repositoryDB.query(
                `SELECT COUNT(*)
                FROM(SELECT "userId", "companyName" AS name, ruc AS identifier FROM companies
                    UNION
                    SELECT "userId", "fullName" AS name, dni AS identifier FROM persons) AS profiles
                JOIN users u ON profiles."userId" = u."userId"
                WHERE u."userRole" = $1;`,
                [userRole]
            );

            console.log(counts) //[ { count: '2' } ]
            const itemCount = parseInt(counts[0].count, 10);
            console.log(itemCount)

            // Consulta con paginación
            const { rows } = await repositoryDB.query(
                `SELECT u."userRole", profiles."userId", profiles.email, profiles.name, profiles.identifier
                FROM(SELECT "userId", email, "companyName" AS name, ruc AS identifier FROM companies
                    UNION
                    SELECT "userId", email, "fullName" AS name, dni AS identifier FROM persons) AS profiles
                JOIN users u ON profiles."userId" = u."userId"
                WHERE u."userRole" = $1
                LIMIT $2 OFFSET $3;`,
                [userRole, limit, offset]
            );

            const pageCount = Math.ceil(itemCount / limit);

            // Devolver la respuesta con información de paginación
            return res.status(200).json({
                status: 'success',
                data: rows,
                pageCount,
                itemCount: itemCount,
                pages: paginate.getArrayPages(req)(3, pageCount, page),
                has_more: paginate.hasNextPages(req)(pageCount)
            });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/:role/new',
    validateURLParams('role'),
    checkAuth,
    allowRoles(['commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/{userRole}/new'
        #swagger.summary = 'Endpoint para crear un nuevo usuario'
        #swagger.description = 'Endpoint para crear un nuevo usuario (customer, auditor, commercial).'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['role'] = {
            in: 'path',
            description: 'Rol de usuario',
            required: true,
            type: 'string'
        }
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        oneOf: [
                            { $ref: "#/components/schemas/NewCompany" },
                            { $ref: "#/components/schemas/NewPerson" }
                        ]
                    },
                    examples: {
                        newCompany: { $ref: "#/components/examples/newCompany" },
                        newPerson: { $ref: "#/components/examples/newPerson" }
                    }
                }
            }
        }
        #swagger.responses[201] = {
            schema: {$ref: "#/components/responses/NewUserResponse"}
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
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        const validRoles = new Set(['customer', 'auditor', 'commercial']);
        const role = req.params.role;

        if (!validRoles.has(role)) {
            return res.status(400).json({ status: 'error', message: 'El rol de usuario no es válido.', code: 'invalid_user_role' });
        }

        try {
            await repositoryDB.connect();


            // Revisar credenciales nuevas
            const { credentials } = req.body;
            if (!credentials) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }
            // Revisar datos de perfil nuevos
            const { profile } = req.body;
            if (!profile) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            const { email, password } = credentials;
            if (!email || !password) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            // Revisar si ya existe un usuario con ese email
            const { rows: users } = await repositoryDB.query(
                `SELECT * FROM users WHERE email = $1;`,
                [email]
            );
            if (users.length > 0) {
                return res.status(400).json({ status: 'error', message: 'Ya existe un usuario con ese email.', code: 'user_already_exists' });
            }

            // Preparar nuevo usuario: email, password, userId, userRole
            const newEmail = email;
            const newPassword = await hashPassword(password);
            const newUserId = uuid()
            const newUserRole = role;

            await repositoryDB.query('BEGIN;'); // Inicia la transaccion

            const { rows: userCreated } = await repositoryDB.query(
                `INSERT INTO users (email, password, "userId", "userRole") VALUES ($1, $2, $3, $4) RETURNING id;`,
                [newEmail, newPassword, newUserId, newUserRole]
            );
            const id = userCreated[0].id;
            if (!id) {
                await repositoryDB.query('ROLLBACK;'); // Cancela la transaccion
                return res.status(500).json({ status: 'error', message: 'No se pudo crear el usuario.', code: 'user_creation_failed' });
            }

            // Preparar nuevo perfil segun rol:
            // customer: userId, companyName, ruc, address, legalRepresentative, email, phone, country, logo
            // auditor: userId, fullName, dni, address, email, phone, country, photo
            // commercial: userId, fullName, dni, address, email, phone, country, photo
            if (role === 'customer') {
                const { companyName, ruc, address, legalRepresentative, email, phone, country } = profile;
                const logoBase64 = profile.logo;
                const logo = await repositoryStorageImg._saveImage(logoBase64);
                const { rows: companyCreated } = await repositoryDB.query(
                    `INSERT INTO companies ("userId", "companyName", ruc, address, "legalRepresentative", email, phone, country, logo) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING "userId", "companyName" AS name, ruc AS identifier ;`,
                    [newUserId, companyName, ruc, address, legalRepresentative, email, phone, country, logo]
                );
                await repositoryDB.query('COMMIT;'); // Finaliza la transaccion
                return res.status(201).json({ status: 'success', data: companyCreated[0] });
            } else if (role === 'auditor' || role === 'commercial') {
                const { fullName, dni, address, email, phone, country } = profile;
                const photoBase64 = profile.photo;
                const photo = await repositoryStorageImg._saveImage(photoBase64);
                const { rows: personCreated } = await repositoryDB.query(
                    `INSERT INTO persons ("userId", "fullName", dni, address, email, phone, country, photo) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "userId", "fullName" AS name, dni AS identifier;`,
                    [newUserId, fullName, dni, address, email, phone, country, photo]
                );
                await repositoryDB.query('COMMIT;'); // Finaliza la transaccion
                return res.status(201).json({ status: 'success', data: personCreated[0] });
            } else {
                await repositoryDB.query('ROLLBACK;'); // Cancela la transaccion
                return res.status(500).json({ status: 'error', message: 'No se pudo crear el usuario.', code: 'user_creation_failed' });
            }
        } catch (error) {
            await repositoryDB.query('ROLLBACK;'); // Cancela la transaccion
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.get(
    '/:role/search',
    validateURLParams('role'),
    checkAuth,
    allowRoles(['auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/{userRole}/search'
        #swagger.summary = 'Endpoint para buscar usuarios'
        #swagger.description = 'Endpoint para buscar usuarios (customer, auditor, commercial).'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['role'] = {
            in: 'path',
            description: 'Rol de usuario',
            required: true,
            type: 'string'
        }
        #swagger.parameters['value'] = {
            in: 'query',
            description: 'Texto a buscar (mínimo 3 caracteres), puede ser el nombre o el número de identificación(RUC, DNI, etc.)',
            required: false,
            type: 'string'
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/SearchUserResponse"
            }
        }
        #swagger.responses[401] = {
            schema:{
                $ref: "#/components/responses/UnauthorizedError"
            }
        }
        #swagger.responses[500] = {
            schema:{
                $ref: "#/components/responses/InternalServerError"
            }
        }
         */
        const validRoles = new Set(['customer', 'auditor', 'commercial', 'employee']);
        const userRole = req.params.role;

        if (!validRoles.has(userRole)) {
            return res.status(400).json({ status: 'error', message: 'El rol de usuario no es válido.', code: 'invalid_user_role' });
        }

        try {
            await repositoryDB.connect();

            //obtener el texto a buscar
            const { value } = req.query;
            if (!value) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }
            if (value.length < 3) {
                return res.status(400).json({ status: 'error', message: 'El texto a buscar debe tener al menos 3 caracteres.', code: 'invalid_search_text' });
            }

            const { rows } = await repositoryDB.query(
                `SELECT u."userRole", profiles."userId", profiles.name, profiles.identifier
                FROM(SELECT "userId", "companyName" AS name, ruc AS identifier FROM companies
                    UNION
                    SELECT "userId", "fullName" AS name, dni AS identifier FROM persons) AS profiles
                JOIN users u ON profiles."userId" = u."userId"
                WHERE u."userRole" = $1 AND ( profiles.name ILIKE $2 OR profiles.identifier ILIKE $2 );`,
                [userRole, `%${value}%`]
            );
            return res.status(200).json({ status: 'success', data: rows });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

///////////////////////////////////////////////////////////////////////////////////////

router.get(
    '/profile/:userId',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
         #swagger.tags = ['Usuarios']
         #swagger.operationId = 'api.users/{userId}'
         #swagger.summary = 'Endpoint para obtener perfil de un usuario'
         #swagger.description = 'Endpoint para obtener datos de perfil de un usuario (customer, auditor, commercial)..'
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
         }
         #swagger.responses[401] = {
             schema:{
                $ref: "#/components/responses/UnauthorizedError"
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
            const { rows: companies } = await repositoryDB.query(
                `SELECT * FROM companies WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (companies.length > 0) {
                return res.status(200).json({ status: 'success', data: companies[0] });
            }

            const { rows: persons } = await repositoryDB.query(
                `SELECT * FROM persons WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (persons.length > 0) {
                return res.status(200).json({ status: 'success', data: persons[0] });
            }
            return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/profile/:userId',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/{userId}'
        #swagger.summary = 'Endpoint para actualizar perfil de un usuario'
        #swagger.description = 'Endpoint para actualizar datos de perfil de un usuario (customer, auditor, commercial)..'
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
                        oneOf: [
                            { $ref: "#/components/schemas/UpdateCompany" },
                            { $ref: "#/components/schemas/UpdatePerson" }
                        ]
                    },
                    examples: {
                        updateCompany: { $ref: "#/components/examples/updateCompany" },
                        updatePerson: { $ref: "#/components/examples/updatePerson" }
                    }
                }
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

            // Revisar datos de perfil nuevos
            const {update} = req.body;
            if (!update) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Faltan campos obligatorios.',
                    code: 'missing_required_fields'
                });
            }

            const {rows: companies} = await repositoryDB.query(
                `SELECT * FROM companies WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (companies.length > 0) {
                const {address} = update;
                const {rows} = await repositoryDB.query(
                    `UPDATE companies SET address = $1 WHERE "userId" = $2`,
                    [address, req.params.userId]
                );
                return res.status(204).json({status: 'success'});
            }

            const {rows: persons} = await repositoryDB.query(
                `SELECT * FROM persons WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (persons.length > 0) {
                const {address, phone} = update;
                const {rows} = await repositoryDB.query(
                    `UPDATE persons SET address = $1, phone = $2 WHERE "userId" = $3`,
                    [address, phone, req.params.userId]
                );
                return res.status(204).json({status: 'success'});
            }
            return res.status(404).json({status: 'error', message: 'User not found.', code: 'user_not_found'});
        } catch (error) {
            return res.status(500).json({status: 'error', message: error.message, code: 'internal_server_error'});
        } finally {
            await repositoryDB.disconnect();
        }
    }
)


router.get(
    '/profile/:userId/image',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/{userId}/image'
        #swagger.summary = 'Endpoint para obtener la foto de perfil de un usuario'
        #swagger.description = 'Endpoint para obtener la foto(url) de perfil de un usuario (customer, auditor, commercial)..'
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
                $ref: "#/components/responses/UserImageResponse"
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
            const { rows: companies } = await repositoryDB.query(
                `SELECT logo FROM companies WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (companies.length > 0) {
                return res.status(200).json({ status: 'success', data: companies[0] });
            }
            const { rows: persons } = await repositoryDB.query(
                `SELECT photo FROM persons WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (persons.length > 0) {
                return res.status(200).json({ status: 'success', data: persons[0] });
            }
            return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.post(
    '/profile/:userId/image',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer', 'auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/{userId}/image'
        #swagger.summary = 'Endpoint para subir la foto de perfil de un usuario'
        #swagger.description = 'Endpoint para subir la foto(base64) de perfil de un usuario (customer, auditor, commercial)..'
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
                        oneOf: [
                            { $ref: "#/components/schemas/UpdateCompanyImage" },
                            { $ref: "#/components/schemas/UpdatePersonImage" }
                        ]
                    },
                    examples: {
                        updateCompanyImage: { $ref: "#/components/examples/updateCompanyImage" },
                        updatePersonImage: { $ref: "#/components/examples/updatePersonImage" }
                    }
                }
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

            const { update } = req.body;
            if (!update) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            const { rows: companies } = await repositoryDB.query(
                `SELECT * FROM companies WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (companies.length > 0) {
                const { logo } = update;
                if (!logo) {
                    return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
                }
                //Eliminar imagen anterior
                const oldLogo = companies[0].logo;
                if (oldLogo) {
                    await repositoryStorageImg._deleteImage(oldLogo);
                }
                //Guardar nueva imagen
                const filePath = await repositoryStorageImg._saveImage(logo);
                const { rows } = await repositoryDB.query(
                    `UPDATE companies SET logo = $1 WHERE "userId" = $2`,
                    [filePath, req.params.userId]
                );
                return res.status(204).json({ status: 'success' });
            }

            const { rows: persons } = await repositoryDB.query(
                `SELECT * FROM persons WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (persons.length > 0) {
                const { photo } = update;
                if (!photo) {
                    return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
                }
                //Eliminar imagen anterior
                const oldPhoto = persons[0].photo;
                if (oldPhoto) {
                    await repositoryStorageImg._deleteImage(oldPhoto);
                }
                //Guardar nueva imagen
                const filePath = await repositoryStorageImg._saveImage(photo);
                const { rows } = await repositoryDB.query(
                    `UPDATE persons SET photo = $1 WHERE "userId" = $2`,
                    [filePath, req.params.userId]
                );
                return res.status(204).json({ status: 'success' });
            }
            return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.post(
    '/change-password/:userId',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin']),
    async (req, res, next) => {
        /*
        #swagger.tags = ['Usuarios']
        #swagger.operationId = 'api.users/change-password/{userId}'
        #swagger.summary = 'Endpoint para cambiar la contraseña de un usuario'
        #swagger.description = 'Endpoint para cambiar la contraseña de un usuario (customer, auditor, commercial)..'
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
                        $ref: "#/components/schemas/ChangePassword"
                    }
                }
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

            const { newPassword } = req.body;
            if (!newPassword) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            const { rows: users } = await repositoryDB.query(
                `SELECT * FROM users WHERE "userId" = $1;`,
                [req.params.userId]
            );
            if (users.length > 0) {
                const { newPassword } = req.body;
                const newPasswordHashed = await hashPassword(newPassword);
                const { rows } = await repositoryDB.query(
                    `UPDATE users SET password = $1 WHERE "userId" = $2`,
                    [newPasswordHashed, req.params.userId]
                );
                return res.status(204).json({ status: 'success' });
            }
            return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        }
    }
)

export default router;

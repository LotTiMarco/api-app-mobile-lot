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
            description: 'Número de elementos por página(10 por defecto, máximo 50)',
            required: false,
            type: 'integer'
        }
        #swagger.responses[200] = {
            schema:{
                $ref: "#/components/responses/AllUsersResponse"
            },
            example: {
                status: "success",
                data: [
                    {
                        userRole: "...",
                        userId: "...",
                        email: "...",
                        name: "..."
                    }
                ],
                pageCount: 1,
                itemCount: 1,
                pages: [
                    {
                        page: 1,
                        url: "/api/users/all?page=1"
                    },
                    {
                        page: 2,
                        url: "/api/users/all?page=2"
                    }
                ],
                has_more: false
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
                `SELECT u."userRole", profiles."userId", profiles.email, profiles.name
                FROM(SELECT "userId", email, "companyName" AS name FROM companies
                    UNION
                    SELECT "userId", email, "fullName" AS name FROM persons) AS profiles
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
        description: 'Número de elementos por página(10 por defecto, máximo 50)',
        required: false,
        type: 'integer'
    }
    #swagger.responses[200] = {
        schema:{
            $ref: "#/components/responses/AllUsersRoleResponse"
        },
        example: {
            status: "success",
            data: [
                {
                    userRole: "...",
                    userId: "...",
                    email: "...",
                    name: "..."
                }
            ],
            pageCount: 1,
            itemCount: 1,
            pages: [
                {
                    page: 1,
                    url: "/api/users/all?page=1"
                },
                {
                    page: 2,
                    url: "/api/users/all?page=2"
                }
            ],
            has_more: false
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
    '/:role',
    validateURLParams('role'),
    checkAuth,
    allowRoles(['auditor', 'commercial', 'admin']),
    async (req, res, next) => {
        const validRoles = new Set(['customer', 'auditor', 'commercial', 'employee']);
        const userRole = req.params.role;

        if (!validRoles.has(userRole)) {
            return res.status(400).json({ status: 'error', message: 'El rol de usuario no es válido.', code: 'invalid_user_role' });
        }
        console.log(userRole)
        try {
            await repositoryDB.connect();

            // Obtener el número de página de la consulta
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const offset = (page - 1) * limit;

            let queryCount = '';
            let optionsCount = [];
            let query = '';
            let options = [];

            switch (userRole) {
                case 'customer': {
                    queryCount = `SELECT COUNT(*) FROM companies;`
                    optionsCount = []

                    query = `SELECT u."userRole", u."userId", u.email AS "userEmail", c.email AS "personalEmail", c."companyName" AS name
                    FROM companies c
                    JOIN users u ON c."userId" = u."userId"
                    LIMIT $1 OFFSET $2;`
                    options = [limit, offset]
                    break;
                }
                case 'auditor': {
                    queryCount = `SELECT COUNT(*) FROM persons p JOIN users u on p."userId" = u."userId" 
                                  WHERE u."userRole" = 'auditor';`
                    optionsCount = []
                    query = `SELECT u."userRole", u."userId", u.email AS "userEmail", p.email AS "personalEmail", p."fullName" AS name
                    FROM persons p
                    JOIN users u ON p."userId" = u."userId"
                    WHERE u."userRole" = 'auditor'
                    LIMIT $1 OFFSET $2;`
                    options = [limit, offset]
                    break;
                }
                case 'commercial': {
                    queryCount = `SELECT COUNT(*) FROM persons p JOIN users u on p."userId" = u."userId" 
                                  WHERE u."userRole" = 'commercial';`
                    optionsCount = []
                    query = `SELECT u."userRole", u."userId", u.email AS "userEmail", p.email AS "personalEmail", p."fullName" AS name
                    FROM persons p
                    JOIN users u ON p."userId" = u."userId"
                    WHERE u."userRole" = 'commercial'
                    LIMIT $1 OFFSET $2;`
                    options = [limit, offset]
                    break;
                }
                case 'employee': {
                    queryCount = `SELECT COUNT(*) FROM persons p JOIN users u on p."userId" = u."userId" 
                                  WHERE u."userRole" != 'admin';`
                    optionsCount = []
                    query = `SELECT u."userRole", u."userId", u.email AS "userEmail", p.email AS "personalEmail", p."fullName" AS name
                    FROM persons p
                    JOIN users u ON p."userId" = u."userId"
                    WHERE u."userRole" != 'admin'
                    LIMIT $1 OFFSET $2;`
                    options = [limit, offset]
                    break;
                }
                default:
                    break;
            }

            console.log(query, options)

            // Obtener el número total de elementos sin la limitación de paginación
            const itemCount = await repositoryDB.query(queryCount, optionsCount);

            // Consulta con paginación
            const { rows } = await repositoryDB.query(query, options);

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
            const { rows: userCreated } = await repositoryDB.query(
                `INSERT INTO users (email, password, "userId", "userRole") VALUES ($1, $2, $3, $4) RETURNING id;`,
                [newEmail, newPassword, newUserId, newUserRole]
            );
            const id = userCreated[0].id;
            if (!id) {
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
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
                    [newUserId, companyName, ruc, address, legalRepresentative, email, phone, country, logo]
                );
                return res.status(201).json({ status: 'success', data: companyCreated[0] });
            } else if (role === 'auditor' || role === 'commercial') {
                const { fullName, dni, address, email, phone, country } = profile;
                const photoBase64 = profile.photo;
                const photo = await repositoryStorageImg._saveImage(photoBase64);
                const { rows: personCreated } = await repositoryDB.query(
                    `INSERT INTO persons ("userId", "fullName", dni, address, email, phone, country, photo) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
                    [newUserId, fullName, dni, address, email, phone, country, photo]
                );
                return res.status(201).json({ status: 'success', data: personCreated[0] });
            } else {
                return res.status(500).json({ status: 'error', message: 'No se pudo crear el usuario.', code: 'user_creation_failed' });
            }
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        }
    }
)

router.get(
    '/user/:userId',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin']),
    async (req, res, next) => {
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

router.get(
    '/:userId/profile/photo',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin', 'auditor']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT logo FROM persons WHERE "userId" = $1;`,
                [req.params.userId]
            );

            if (rows.length > 0) {
                return res.status(200).json({ status: 'success', data: rows[0] });
            } else {
                return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
            }
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
)

router.post(
    '/:userId/profile/photo',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin', 'auditor']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();

            const { update } = req.body;
            if (!update) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            const { logo } = update;
            if (!logo) {
                return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
            }

            const filePath = await repositoryStorageImg._saveImage(logo);
            const { rows } = await repositoryDB.query(
                `UPDATE persons SET logo = $1 WHERE "userId" = $2 RETURNING logo;`,
                [filePath, req.params.userId]
            );

            if (rows.length > 0) {
                return res.status(200).json({ status: 'success', data: rows[0] });
            } else {
                return res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
            }
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

export default router;

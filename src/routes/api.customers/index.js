import { Router} from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import {checkAuth} from "../../middlewares/checkAuth.js";
import {validateURLParams} from "../../middlewares/validateURLParams.js";
import {allowRoles} from "../../middlewares/allowRoles.js";
import RepositoryServerStorageImg from "../../repository/Repository.serverStorage.img.js";

const router = Router();
const repositoryDB = new RepositoryPostgre();
const repositoryStorageImg = new RepositoryServerStorageImg()

router.get('/', async (req, res, next) => {
    try {
        return res.status(200).json({ status: 'success', message: "API PARA EMPRESAS" });
    } catch (error) {
        next(error);
    }
});

router.get(
    '/:userId/profile',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT * FROM companies WHERE "userId" = $1;`,
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
);

router.post(
    '/:userId/profile',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer']),
    async (req, res, next) => {
        const { update } = req.body;

        if (!update) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
        }

        const { address, phone, country } = update;

        if (!address || !phone || !country) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
        }

        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `UPDATE companies SET address = $1, phone = $2, country = $3 WHERE "userId" = $4 RETURNING *;`,
                [address, phone, country, req.params.userId]
            );
            console.log(rows);

            if (rows.length > 0) {
                return res.status(204).json({ status: 'success' });
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

router.post(
    '/:userId/profile/logo',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['customer']),
    async (req, res, next) => {
        const { update } = req.body;

        if (!update) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
        }

        const { logo } = update;

        if (!logo) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios.', code: 'missing_required_fields' });
        }

        try {
            const filePath = await repositoryStorageImg._saveImage(logo);
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `UPDATE companies SET logo = $1 WHERE "userId" = $2 RETURNING logo;`,
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

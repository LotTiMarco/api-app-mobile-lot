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
        res.status(200).json({ status: 'success', message: "API PARA DOCUMENTOS" });
    } catch (error) {
        next(error);
    }
});

router.get(
    '/:userId/years',
    validateURLParams('userId'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT year FROM "customersYears" WHERE "userId" = $1;`,
                [req.params.userId]
            );
            console.log(rows); // [ { year: '2020' }, { year: '2022' } ]

            if (rows.length > 0) {
                const years = []
                rows.forEach(row => {
                    years.push(row.year)
                });
                res.status(200).json({ status: 'success', data: { years: years} });
            } else {
                res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
            }
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:userId/:year/files',
    validateURLParams('userId', 'year'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();
            const { rows } = await repositoryDB.query(
                `SELECT "fileIndex" FROM files f 
                        where f."customerYearId" = (
                            select "customerYearId" from "customersYears" cy 
                            where cy."userId" = $1 and cy."year" = $2
                        );`,
                [req.params.userId, req.params.year]
            );
            console.log(rows);

            if (rows.length > 0) {
                const files = []
                rows.forEach(row => {
                    files.push(row.fileIndex)
                });
                res.status(200).json({ status: 'success', data: { files: files} });
            } else {
                res.status(404).json({ status: 'error', message: 'User not found.', code: 'user_not_found' });
            }
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:userId/:year/:fileIndex/certification',
    validateURLParams('userId', 'year', 'fileIndex'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();

            const { rows: quotes } = await repositoryDB.query(
                `SELECT name, url FROM quotes q 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: contractsBillings } = await repositoryDB.query(
                `SELECT name, url FROM "contractsBillings" ctb 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: auditPlans } = await repositoryDB.query(
                `SELECT name, url FROM "auditPlans" ap 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: auditReports } = await repositoryDB.query(
                `SELECT name, url FROM "auditReports" ar 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: certificates } = await repositoryDB.query(
                `SELECT name, url FROM certificates cf 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    quotes: quotes,
                    contractsBillings: contractsBillings,
                    auditPlans: auditPlans,
                    auditReports: auditReports,
                    certificates: certificates
                }
            });

        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:userId/:year/:fileIndex/certification/monitoring',
    validateURLParams('userId', 'year', 'fileIndex'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();

            const { rows: monitoringPlans } = await repositoryDB.query(
                `SELECT name, url FROM "monitoringPlans" mp 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: monitoringReports } = await repositoryDB.query(
                `SELECT name, url FROM "monitoringReports" mr
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'certificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    monitoringPlans: monitoringPlans,
                    monitoringReports: monitoringReports
                }
            });

        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:userId/:year/:fileIndex/recertification',
    validateURLParams('userId', 'year', 'fileIndex'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();

            const { rows: quotes } = await repositoryDB.query(
                `SELECT name, url FROM quotes q 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: contractsBillings } = await repositoryDB.query(
                `SELECT name, url FROM "contractsBillings" ctb 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: auditPlans } = await repositoryDB.query(
                `SELECT name, url FROM "recertificationPlans" ap 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: auditReports } = await repositoryDB.query(
                `SELECT name, url FROM "recertificationReports" ar 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: certificates } = await repositoryDB.query(
                `SELECT name, url FROM certificates cf 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    quotes: quotes,
                    contractsBillings: contractsBillings,
                    auditPlans: auditPlans,
                    auditReports: auditReports,
                    certificates: certificates
                }
            });

        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

router.get(
    '/:userId/:year/:fileIndex/recertification/monitoring',
    validateURLParams('userId', 'year', 'fileIndex'),
    checkAuth,
    allowRoles(['admin', 'customer']),
    async (req, res, next) => {
        try {
            await repositoryDB.connect();

            const { rows: monitoringPlans } = await repositoryDB.query(
                `SELECT name, url FROM "monitoringPlans" mp 
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            const { rows: monitoringReports } = await repositoryDB.query(
                `SELECT name, url FROM "monitoringReports" mr
                        WHERE "fileId" = (
                            SELECT "fileId" FROM files f 
                            WHERE f."customerYearId" = (
                                SELECT "customerYearId" FROM "customersYears" cy 
                                WHERE cy."userId" = $1 AND cy."year" = $2
                            ) AND "fileIndex" = $3
                        ) AND "typeProcess" = 'recertificacion';`,
                [req.params.userId, req.params.year, req.params.fileIndex]
            );

            res.status(200).json({
                status: 'success',
                data: {
                    monitoringPlans: monitoringPlans,
                    monitoringReports: monitoringReports
                }
            });

        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        } finally {
            await repositoryDB.disconnect();
        }
    }
);

export default router;
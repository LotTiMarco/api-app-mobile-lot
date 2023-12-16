import { Router } from 'express';
import RepositoryPostgre from "../../repository/Repository.postgre.js";
import { createJWT } from "../../functions/createJWT.js";
import bcrypt from 'bcrypt';

const router = Router();
const repository = new RepositoryPostgre();

router.get('/', async (req, res, next) => {
    try {
        res.status(200).json({ status: 'success', message: "API PARA AUTENTICACION" });
    } catch (error) {
        next(error);
    }
});

router.post('/login',async (req, res, next) => {
    //decode base64
    const auth = req.headers['authorization'];
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    //console.log(email, password);

    try {
        await repository.connect();
        const { rows } = await repository.query(
            `SELECT "userId", "userRole", password FROM users WHERE email = $1;`,
            [email]
        );

        //console.log(rows);

        if (rows.length > 0) {
            const storedPassword = rows[0].password;
            if (await bcrypt.compare(password, storedPassword)) {
                const payload = {
                    userId: rows[0].userId,
                    userRole: rows[0].userRole,
                };

                //console.log(payload);

                payload.accessToken = createJWT(payload);
                res.status(200).json({ status: 'success', data: payload });
            } else {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario o contraseña inválida.',
                    code: 'authentication_failed',
                });
            }
        } else {
            res.status(401).json({ status: 'error', message: 'Usuario o contraseña invalida.', code: 'authentication_failed' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
    } finally {
        await repository.disconnect();
    }
});

export default router;
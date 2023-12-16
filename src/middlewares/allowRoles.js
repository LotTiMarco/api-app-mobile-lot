import RepositoryPostgre from "../repository/Repository.postgre.js";

// Midleware to check if the user has the required role
export const allowRoles = (...roles) => {
    return async (req, res, next) => {
        const repository = new RepositoryPostgre();
        try {
            await repository.connect();
            const { rows } = await repository.query(
                `SELECT email, "userRole" FROM users WHERE "userId" = $1`,
                [req.userId]
            );

            const user = rows[0];
            if (!user) {
                return res.status(401).json({ status: 'error', message: 'Usuario no authorizado.', code: 'unauthorized' });
            }

            if (!roles[0].includes(user.userRole) && user.userRole === req.userRole) {
                return res.status(403).json({ status: 'error', message: 'Usuario no authorizado.', code: "forbidden" });
            }
            next();
        } catch (error) {
            return res.status(500).json({ status: 'error', message: 'Error al verificar el rol del usuario.', code: 'internal_server_error' });
        } finally {
            await repository.disconnect();
        }
    };
}
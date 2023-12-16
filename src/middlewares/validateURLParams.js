// Middleware de validación de parámetros de la URL
export const validateURLParams = (...requiredParams) => {
    return (req, res, next) => {
        const params = req.params;
        const paramsKeys = Object.keys(params);

        const missingParams = requiredParams.filter(param => !paramsKeys.includes(param));

        if (missingParams.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Parámetros faltantes en la URL: ${missingParams.join(', ')}`,
                code: 'missing_url_params'
            });
        }

        next();
    };
};
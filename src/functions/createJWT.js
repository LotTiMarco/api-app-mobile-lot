import jwt from 'jsonwebtoken';
const { sign: generateJWT } = jwt;
export function createJWT( payload ) {
    const secretKey = process.env.AAML_JWT_SECRET_KEY;
    return generateJWT(payload, secretKey, { noTimestamp: true });
}
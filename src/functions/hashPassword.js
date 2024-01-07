import bcrypt from 'bcrypt';

export async function hashPassword(password, count = 0) {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        if (count >= 5) {
            throw new Error('No se pudo hashear la contraseña');
        }
        return hashPassword(password, count + 1);
    }
}
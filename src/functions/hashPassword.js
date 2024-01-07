import bcrypt from 'bcrypt';

export async function hashPassword(password, count = 0) {
    try {
        let count = count;
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        if (count > 5) {
            throw new Error('No se pudo hashear la contraseña');
        }
        await hashPassword(password, count++);
    }
}
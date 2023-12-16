export function validateBase64String(base64str) {
    const matches = base64str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('String en formato base64 inválido');
    }

    const expectedLength = Math.floor(matches[2].length * 3 / 4);

    if (matches[2].length % 4 !== 0) {
        throw new Error('Longitud de cadena base64 no válida');
    }

    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length !== expectedLength) {
        throw new Error('Longitud de cadena base64 incorrecta');
    }

    return buffer;
}

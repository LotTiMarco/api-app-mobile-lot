const crypto = require('crypto');

// Función para calcular el hash MD5 de una cadena
const calcularMD5 = (cadena) => {
    const md5sum = crypto.createHash('md5');
    md5sum.update(cadena);
    return md5sum.digest('hex');
};

// Ejemplo de uso
const cadenaOriginal = 'Hola, mundo!';
const hashMD5 = calcularMD5(cadenaOriginal);
const hashMD5_2 = calcularMD5(cadenaOriginal);

console.log(`Cadena original: ${cadenaOriginal}`);
console.log(`Hash MD5: ${hashMD5}`);
console.log(`Hash MD5 2: ${hashMD5_2}`);

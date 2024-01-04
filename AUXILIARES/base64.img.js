const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const imageToBase64 = require('image-to-base64');
const converToImage= require('convert-base64-to-image');



async function saveBase64ToFile(imageUrl, filePath) {
    try {
        // Obtener la cadena base64 de la imagen
        const base64String = await imageToBase64(imageUrl);

        // Asegurarse de que el directorio exista
        const directoryPath = path.dirname(filePath);
        mkdirp.sync(directoryPath);

        // Escribir la cadena base64 en un archivo .txt
        fs.writeFileSync(filePath, base64String);

        console.log('Cadena base64 guardada en:', filePath);
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
    }
}

// Ejemplo de uso
const imageUrl = 'https://www.lotinternacional.com/cms/_imgs/sistema/1//favicon.jpg';
const outputFile = 'base64_output.txt';

//saveBase64ToFile(imageUrl, outputFile);

//====================================================================================================

const base64_image2 = 'data:image/png;base64,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'




const base64 = 'data:image/jpeg;base64,' + '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';

//


const pathToSaveImage = './image.png'
// try {
//     converToImage.converBase64ToImage(base64, pathToSaveImage);
//     console.log('Image saved successfully');
// } catch (error) {
//     console.log(error);
// }


//====================================================================================================
function decodeBase64Image(base64str, fileName) {
    const matches = base64str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('String en formato base64 inválido');
    }

    const fileExtension = matches[1].split('/')[1]; console.log(fileExtension);

    const expectedLength = Math.floor(matches[2].length * 3 / 4);

    if (matches[2].length % 4 !== 0) {
        throw new Error('Longitud de cadena base64 no válida');
    }

    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length !== expectedLength) {
        throw new Error('Longitud de cadena base64 incorrecta');
    }

    if (!buffer || buffer.length === 0) {
        throw new Error('Error al decodificar la imagen en base64');
    }

    const storeFileName = fileName + '.' + fileExtension;

    // Puedes guardar el buffer como archivo si es necesario
    fs.writeFileSync(storeFileName, buffer);

    return {
        name: storeFileName,
        type: fileExtension,
        data: buffer,
    };
}

// Ejemplo de uso
const base64String = base64;
const fileName = 'imagen_decodificada';

try {
    const decodedImage = decodeBase64Image(base64String, fileName);
    console.log('Imagen decodificada con éxito:', decodedImage);
} catch (error) {
    console.error('Error al decodificar la imagen:', error.message);
}





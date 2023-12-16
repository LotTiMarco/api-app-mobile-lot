import IRepositoryStoreImg from "./IRepository.store.img.js";
import {validateBase64String} from "../functions/validateBase64String.js";
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

export default class RepositoryServerStorageImg extends IRepositoryStoreImg {
    constructor() {
        super();
        this._storage = {};
    }

    async _saveImage(base64String) {
        try {
            mkdirp.sync('uploads/images');
            const buffer = validateBase64String(base64String);

            if (!buffer || buffer.length === 0) {
                throw new Error('Error al decodificar la imagen en base64');
            }

            const fileExtension = base64String.split(';')[0].split('/')[1];
            const path = 'uploads/images/';
            const fileName = uuid() + '.' + fileExtension;
            const filePath = path + fileName;

            fs.writeFileSync(filePath, buffer);// Guardar el buffer como archivo

            return filePath;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async _deleteImage(filePath) {
        try {
            fs.unlinkSync(filePath); // Elimina el archivo
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar la imagen: ${error.message}`);
        }
    }
}
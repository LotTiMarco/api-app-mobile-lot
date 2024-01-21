import { validateBase64String } from "../functions/validateBase64String.js";
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

export default class RepositoryServerStorageDoc {
    constructor() {
        this._storage = {};
    }

    async _saveDoc() {
        console.log('RepositoryServerStorageDoc._saveDoc() not implemented');
        console.log('use multer middleware to save docs');
    }

    async _deleteDoc(filePath) {
        try {
            // Comprueba si la ruta al archivo existe
            if (fs.existsSync(filePath)) {
                // Si existe, elimina el archivo
                fs.unlinkSync(filePath);
                //console.log(`Documento eliminado exitosamente: ${filePath}`);
            } else {
                // Si no existe, muestra un mensaje y termina sin lanzar un error
                console.log(`El documento no existe en la ruta: ${filePath}`);
            }
        } catch (error) {
            throw new Error(`Error al eliminar el documento: ${error.message}`);
        }
    }
}
import express from 'express';
import multer from 'multer';
import path from 'path';

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads') // Directorio donde se almacenarán los archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = file.originalname.split('.').slice(0, -1).join('.');
        const extension = path.extname(file.originalname);
        cb(null, `${filename}-${uniqueSuffix}${extension}`);
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            // Verificar si el tipo MIME del archivo es una imagen o un PDF
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen o un PDF'));
        }
    }
});


// Configuración de multer para la carga de documentos
const storageDocs = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/docs') // Directorio donde se almacenarán los archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = file.originalname.split('.').slice(0, -1).join('.');
        const extension = path.extname(file.originalname);
        cb(null, `${filename}-${uniqueSuffix}${extension}`);
    }
});

export const uploadPdf = multer({
    storage: storageDocs,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('El archivo debe ser un PDF'));
        }
        cb(null, true);
    }
});


// Configuración de multer para la carga de imagenes
const storageImages = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images') // Directorio donde se almacenarán los archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = file.originalname.split('.').slice(0, -1).join('.');
        const extension = path.extname(file.originalname);
        cb(null, `${filename}-${uniqueSuffix}${extension}`);
    }
});

export const uploadImage = multer({
    storage: storageImages,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/') {
            return cb(new Error('El archivo debe ser un PDF'));
        }
        cb(null, true);
    }
});




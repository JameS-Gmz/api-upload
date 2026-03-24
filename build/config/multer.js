"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.fileFilter = exports.storage = void 0;
/**
 * Configuration Multer : stockage sur disque sous `uploads/`, filtre d’extensions et limite de taille (100 Mo).
 */
const multer = require('multer');
const path = require('path');
exports.storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['.jpeg', '.jpg', '.png', '.gif', '.zip', '.exe'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(fileExt)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Type de fichier non autorisé : ${fileExt}`), false);
    }
};
exports.fileFilter = fileFilter;
exports.upload = multer({
    storage: exports.storage,
    limits: { fileSize: 1024 * 1024 * 100 },
    fileFilter: exports.fileFilter
});

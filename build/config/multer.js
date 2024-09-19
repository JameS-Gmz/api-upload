"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.fileFilter = exports.storage = void 0;
const multer = require('multer');
const path = require('path');
// Configuration du stockage avec Multer
exports.storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads'); // Chemin vers le répertoire uploads
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Génère un nom unique
    }
});
// Filtrer les types de fichiers autorisés
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
// Initialiser Multer avec le filtre et la limite de taille (ici 100 Mo)
exports.upload = multer({
    storage: exports.storage,
    limits: { fileSize: 1024 * 1024 * 100 }, // 100 Mo de limite de taille
    fileFilter: exports.fileFilter
});

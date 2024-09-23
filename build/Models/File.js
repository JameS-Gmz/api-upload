"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoute = exports.File = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../database.js");
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
const path_1 = __importDefault(require("path"));
// Étendre le modèle Sequelize avec les attributs du fichier
class File extends sequelize_1.Model {
    id;
    filename;
    filepath;
    fileType;
    fileSize;
    uploadDate;
    gameId;
}
exports.File = File;
// Définir le modèle avec Sequelize
File.init({
    filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    filepath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    uploadDate: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    gameId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: database_js_1.sequelize,
    tableName: 'Files',
});
exports.FileRoute = (0, express_1.Router)();
exports.FileRoute.post('/upload/file', multer_js_1.upload.single('file'), async (req, res) => {
    let { gameId } = req.body;
    gameId = parseInt(gameId, 10);
    try {
        if (!req.file || !gameId) {
            return res.status(400).json({ error: 'No File or No GameId' });
        }
        const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
        if (!gameResponse.ok) {
            return res.status(404).json({ error: 'GameId not found in the database.' });
        }
        const file = await File.create({
            filename: req.file.filename,
            filepath: req.file.path,
            fileType: path_1.default.extname(req.file.originalname),
            fileSize: req.file.size,
            gameId: gameId
        });
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            file,
            fileUrl: `http://localhost:9091/uploads/${req.file.filename}`
        });
    }
    catch (error) {
        console.error('Erreur lors du téléversement', error);
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
    }
});
exports.FileRoute.get('/game/image/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }
        // Rechercher le fichier dans la base de données
        const file = await File.findOne({ where: { gameId: parsedGameId } });
        if (!file) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }
        // Utiliser 'filepath' pour générer le lien vers l'image
        const relativeFilePath = file.filepath.replace('build/', ''); // Supprime 'build/' pour obtenir un chemin relatif utilisable
        const fileUrl = `http://localhost:9091/${relativeFilePath}`;
        console.log('URL générée :', fileUrl); // Vérifie l'URL dans les logs
        res.json({ fileUrl });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'image', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
    }
});

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
const path_1 = __importDefault(require("path")); // Importation du module path
exports.File = database_js_1.sequelize.define('File', {
    filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    filepath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: sequelize_1.DataTypes.STRING, // Par exemple '.exe' ou '.zip'
        allowNull: false
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER, // Taille du fichier en octets
        allowNull: true
    },
    uploadDate: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    gameId: {
        type: sequelize_1.DataTypes.INTEGER, // Supprimer la référence étrangère, ne sera pas liée à une autre table
        allowNull: false
    }
});
exports.FileRoute = (0, express_1.Router)();
exports.FileRoute.post('/upload/file', multer_js_1.upload.single('file'), async (req, res) => {
    const { gameId } = req.body;
    const game_Id = gameId;
    try {
        if (!req.file || !game_Id) {
            return res.status(400).json({ error: 'No File or No GameId' });
        }
        const gameResponse = await fetch(`http://localhost:9090/game/id/${game_Id}`);
        if (!gameResponse.ok) {
            return res.status(404).json({ error: 'GameId not found in the database.' });
        }
        const file = await exports.File.create({
            filename: req.file.filename,
            filepath: req.file.path,
            fileType: path_1.default.extname(req.file.originalname),
            fileSize: req.file.size,
            gameId: gameId
        });
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            file,
            fileUrl: 'http://localhost:9091/uploads/file/${filename}'
        });
    }
    catch (error) {
        console.error('Erreur lors du téléversement', error);
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
    }
});

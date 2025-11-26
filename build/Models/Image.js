"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRoute = exports.Image = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../database.js");
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
const path_1 = __importDefault(require("path"));
exports.Image = database_js_1.sequelize.define('Image', {
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
});
exports.ImageRoute = (0, express_1.Router)();
exports.ImageRoute.post('/upload/image', multer_js_1.upload.single('image'), async (req, res) => {
    const { filename, filepath, uploadDate } = req.body;
    try {
        const image = await exports.Image.create({
            filename,
            filepath,
            uploadDate
        });
        res.status(201).json({
            message: 'Image uploadée avec succès',
            image
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors du téléversement d\'image' });
    }
});
// Route pour récupérer une image par gameId
exports.ImageRoute.get('/image/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }
        // Rechercher l'image dans la table Images
        const image = await exports.Image.findOne({ where: { gameId: parsedGameId } });
        if (!image) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }
        // Générer l'URL de l'image
        const fileUrl = `http://localhost:9091/uploads/${path_1.default.basename(image.dataValues.filepath)}`;
        res.json({ fileUrl });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'image', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
    }
});
// Route pour récupérer toutes les images d'un jeu
exports.ImageRoute.get('/images/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }
        // Rechercher toutes les images associées à ce gameId dans la table Images
        const images = await exports.Image.findAll({ where: { gameId: parsedGameId } });
        if (!images || images.length === 0) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }
        // Générez les URLs des images en fonction de leurs chemins
        const imageUrls = images.map(image => ({
            url: `http://localhost:9091/uploads/${path_1.default.basename(image.dataValues.filepath)}`
        }));
        res.json({ images: imageUrls });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des images', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des images' });
    }
});

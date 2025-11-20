"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoute = exports.FileUpload = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../database.js");
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
const path_1 = __importDefault(require("path"));
// Étendre le modèle Sequelize avec les attributs du fichier
exports.FileUpload = database_js_1.sequelize.define('File', {
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
exports.FileRoute = (0, express_1.Router)();
exports.FileRoute.post('/upload/file', multer_js_1.upload.single('file'), async (req, res) => {
    let { gameId } = req.body;
    gameId = parseInt(gameId, 10);
    req.file;
    try {
        if (!req.file || !gameId) {
            return res.status(400).json({ error: 'No File or No GameId' });
        }
        // Vérifier si le jeu existe
        const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
        if (!gameResponse.ok) {
            return res.status(404).json({ error: 'GameId not found in the database.' });
        }
        // Mapping des noms de fichiers vers les IDs de jeux
        const gameMapping = {
            'BattleQuest.png': 1,
            'SurvivalIsland.png': 2,
            'SpaceOdyssey.png': 3,
            'FantasyWarrior.png': 4,
            'CyberRunner.png': 5,
            'MysticRealm.png': 6,
            'ZombieApocalypse.png': 7,
            'OceanExplorer.png': 8,
            'RacingLegends.png': 9,
            'PuzzleMaster.png': 10
        };
        // Créer l'entrée dans la base de données
        const createdFile = await exports.FileUpload.create({
            filename: req.file.filename,
            filepath: req.file.path,
            fileType: path_1.default.extname(req.file.originalname),
            fileSize: req.file.size,
            gameId: gameId
        });
        // Construire l'URL du fichier
        const fileUrl = `http://localhost:9091/upload/${req.file.filename}`;
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            file: createdFile,
            fileUrl: fileUrl
        });
    }
    catch (error) {
        console.error('Erreur lors du téléversement:', error);
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
    }
});
exports.FileRoute.post('/upload/multiple/:gameId', multer_js_1.upload.array('files', 10), async (req, res) => {
    try {
        const gameId = req.params.gameId;
        req.files;
        // Vérifiez si le jeu existe
        const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
        if (!gameResponse.ok) {
            return res.status(404).json({ error: 'GameId not found in the database.' });
        }
        // Vérifier si des fichiers ont été uploadés
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }
        // Préparer les données pour `bulkCreate`
        const fileData = req.files.map((file) => ({
            filename: file.filename,
            filepath: file.path,
            fileType: path_1.default.extname(file.originalname),
            fileSize: file.size,
            gameId: gameId
        }));
        // Enregistrez tous les fichiers avec bulkCreate
        const savedFiles = await exports.FileUpload.bulkCreate(fileData);
        res.status(201).json({
            message: 'Fichiers uploadés avec succès',
            files: savedFiles
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'upload des fichiers:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
    }
});
exports.FileRoute.get('/image/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }
        // Rechercher l'image dans la base de données
        const file = await exports.FileUpload.findOne({ where: { gameId: parsedGameId } });
        if (!file) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }
        // Générer l'URL de l'image
        const fileUrl = `http://localhost:9091/uploads/${path_1.default.basename(file.dataValues.filepath)}`;
        res.json({ fileUrl });
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'image', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
    }
});
exports.FileRoute.get('/images/:gameId', async (req, res) => {
    const { gameId } = req.params;
    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }
        // Rechercher tous les fichiers associés à ce gameId dans la base de données
        const files = await exports.FileUpload.findAll({ where: { gameId: parsedGameId } });
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }
        // Générez les URLs des fichiers en fonction de leurs chemins
        const fileUrls = files.map(file => ({
            url: `http://localhost:9091/uploads/${path_1.default.basename(file.dataValues.filepath)}`
        }));
        res.json({ files: fileUrls });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des images', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des images' });
    }
});

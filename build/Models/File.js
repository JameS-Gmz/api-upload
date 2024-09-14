"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoute = exports.File = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../database.js");
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
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
    }
});
exports.FileRoute = (0, express_1.Router)();
exports.FileRoute.post('/upload', multer_js_1.upload.single('file'), async (req, res) => {
    const { filename, filepath, fileSize, fileType } = req.body;
    try {
        const file = await exports.File.create({
            filename,
            filepath,
            fileType, // Ex. .exe ou .zip
            fileSize // Taille du fichier en octets
        });
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            file
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
    }
});

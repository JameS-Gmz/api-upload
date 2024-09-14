"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRoute = exports.Image = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../database.js");
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
exports.Image = database_js_1.sequelize.define('Image', {
    filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    filepath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    uploadDate: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
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

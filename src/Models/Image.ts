import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";

export const Image = sequelize.define('Image', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filepath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

export const ImageRoute = Router();

ImageRoute.post('/upload/image', upload.single('image'), async (req, res) => {
    const {filename,filepath,uploadDate} = req.body
    try {
        const image = await Image.create({
            filename,
            filepath,
            uploadDate
        });

        res.status(201).json({
            message: 'Image uploadée avec succès',
            image
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du téléversement d\'image' });
    }
});
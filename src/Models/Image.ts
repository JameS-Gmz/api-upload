/**
 * Modèle Sequelize `Image` et routes associées (téléversement, lecture par `gameId`, URLs vers `/uploads`).
 */
import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";
import path from 'path';

export const Image = sequelize.define('Image', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filepath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false
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

ImageRoute.get('/image/:gameId', async (req, res) => {
    const { gameId } = req.params;

    try {
        const parsedGameId = parseInt(gameId, 10);
        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }

        const image = await Image.findOne({ where: { gameId: parsedGameId } });

        if (!image) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }

        const fileUrl = `http://localhost:9091/uploads/${path.basename(image.dataValues.filepath)}`;
        res.json({ fileUrl });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
    }
});

ImageRoute.get('/images/:gameId', async (req, res) => {
    const { gameId } = req.params;

    try {
        const parsedGameId = parseInt(gameId, 10);

        if (isNaN(parsedGameId)) {
            return res.status(400).json({ error: 'gameId invalide' });
        }

        const images = await Image.findAll({ where: { gameId: parsedGameId } });

        if (!images || images.length === 0) {
            return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
        }

        const imageUrls = images.map(image => ({
            url: `http://localhost:9091/uploads/${path.basename(image.dataValues.filepath)}`
        }));

        res.json({ images: imageUrls });
    } catch (error) {
        console.error('Erreur lors de la récupération des images', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des images' });
    }
});
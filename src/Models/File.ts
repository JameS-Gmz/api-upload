import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";

export const File = sequelize.define('File', {
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filepath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileType: {
        type: DataTypes.STRING,  // Par exemple '.exe' ou '.zip'
        allowNull: false
      },
      fileSize: {
        type: DataTypes.INTEGER,  // Taille du fichier en octets
        allowNull: true
      },
      uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    export const FileRoute = Router();

    FileRoute.post('/upload', upload.single('file'), async (req, res) => {
      const { filename, filepath, fileSize, fileType } = req.body;
      try {
        const file = await File.create({
          filename,
          filepath,
          fileType, // Ex. .exe ou .zip
          fileSize // Taille du fichier en octets
        });
        res.status(201).json({
          message: 'Fichier uploadé avec succès',
          file
        });
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
      }
    });
 
import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";
import path from 'path';  // Importation du module path


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

    FileRoute.post('/upload/file', upload.single('file'), async (req, res) => {
    
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }
    
        const file = await File.create({
          filename: req.file.filename,
          filepath: req.file.path,
          fileType: path.extname(req.file.originalname),
          fileSize: req.file.size
        });
    
        res.status(201).json({
          message: 'Fichier uploadé avec succès',
          file
        });
      } catch (error) {
        console.error('Erreur lors du téléversement', error);
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
      }
    });
 
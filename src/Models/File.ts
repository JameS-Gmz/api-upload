import { DataTypes, INTEGER } from "sequelize";
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
      },
      gameId: {
        type: DataTypes.INTEGER, // Supprimer la référence étrangère, ne sera pas liée à une autre table
        allowNull: false
      }
    });

    export const FileRoute = Router();

    FileRoute.post('/upload/file', upload.single('file'), async (req, res) => {
      const {gameId} = req.body;
      const game_Id : Number = gameId
      try {
        if (!req.file || !game_Id) {
          return res.status(400).json({ error: 'No File or No GameId' });
        }
        
        const gameResponse = await fetch(`http://localhost:9090/game/id/${game_Id}`);
        if (!gameResponse.ok) {
          return res.status(404).json({ error: 'GameId not found in the database.' });
        }
    
        const file = await File.create({
          filename: req.file.filename,
          filepath: req.file.path,
          fileType: path.extname(req.file.originalname),
          fileSize: req.file.size,
          gameId: gameId
        });
    
        res.status(201).json({
          message: 'Fichier uploadé avec succès',
          file,
          fileUrl : 'http://localhost:9091/uploads/file/${filename}'
        });
      } catch (error) {
        console.error('Erreur lors du téléversement', error);
        res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
      }
    });
 
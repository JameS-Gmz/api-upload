import { DataTypes, INTEGER, Model } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";
import path from 'path';

// Définir une interface pour le modèle File
interface FileAttributes {
  id?: number;
  filename: string;
  filepath: string;
  fileType: string;
  fileSize?: number;
  uploadDate?: Date;
  gameId: number;
}

// Étendre le modèle Sequelize avec les attributs du fichier
export class File extends Model<FileAttributes> implements FileAttributes {
   id!: number;
   filename!: string;
   filepath!: string;
   fileType!: string;
   fileSize?: number;
   uploadDate?: Date;
   gameId!: number;
}

// Définir le modèle avec Sequelize
File.init({
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
}, {
  sequelize,
  tableName: 'Files',
});

export const FileRoute = Router();

FileRoute.post('/upload/file', upload.single('file'), async (req, res) => {
  let { gameId } = req.body;
  gameId = parseInt(gameId, 10); 
  try {
    if (!req.file || !gameId) {
      return res.status(400).json({ error: 'No File or No GameId' });
    }

    const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
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
      fileUrl: `http://localhost:9091/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur lors du téléversement', error);
    res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
  }
});


FileRoute.get('/game/image/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const parsedGameId = parseInt(gameId, 10);

    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: 'gameId invalide' });
    }

    // Rechercher le fichier dans la base de données
    const file = await File.findOne({ where: { gameId: parsedGameId } });

    if (!file) {
      return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
    }

    // Utiliser 'filepath' pour générer le lien vers l'image
    const relativeFilePath = file.filepath.replace('build/', '');  // Supprime 'build/' pour obtenir un chemin relatif utilisable
    const fileUrl = `http://localhost:9091/${relativeFilePath}`;

    console.log('URL générée :', fileUrl);  // Vérifie l'URL dans les logs
    res.json({ fileUrl });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
  }
});



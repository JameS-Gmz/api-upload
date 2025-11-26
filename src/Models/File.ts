import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { upload } from "../config/multer.js";
import path from 'path';

// Étendre le modèle Sequelize avec les attributs du fichier
export const FileUpload = sequelize.define('File',{
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

export const FileRoute = Router();

FileRoute.post('/upload/file', upload.single('file'), async (req, res) => {
  let { gameId } = req.body;
  gameId = parseInt(gameId, 10);
  req.file as Express.Multer.File;

  try {
    if (!req.file || !gameId) {
      return res.status(400).json({ error: 'No File or No GameId' });
    }

    // Vérifier si le jeu existe
    const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'GameId not found in the database.' });
    }

    // Importer le modèle Image dynamiquement
    const { Image } = await import('./Image.js');
    
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
    const isImage = imageExtensions.includes(fileExtension);

    if (isImage) {
      // Enregistrer dans la table Images
      const createdImage = await Image.create({
        filename: req.file.filename,
        filepath: req.file.path,
        fileType: fileExtension,
        fileSize: req.file.size,
        gameId: gameId
      });

      const fileUrl = `http://localhost:9091/uploads/${path.basename(req.file.path)}`;

      res.status(201).json({
        message: 'Image uploadée avec succès',
        image: createdImage,
        fileUrl: fileUrl
      });
    } else {
      // Enregistrer dans la table Files (pour .exe et autres fichiers)
      const createdFile = await FileUpload.create({
        filename: req.file.filename,
        filepath: req.file.path,
        fileType: fileExtension,
        fileSize: req.file.size,
        gameId: gameId
      });

      const fileUrl = `http://localhost:9091/uploads/${path.basename(req.file.path)}`;

      res.status(201).json({
        message: 'Fichier uploadé avec succès',
        file: createdFile,
        fileUrl: fileUrl
      });
    }

  } catch (error) {
    console.error('Erreur lors du téléversement:', error);
    res.status(500).json({ error: 'Erreur lors du téléversement du fichier' });
  }
});
  


FileRoute.post('/upload/multiple/:gameId', upload.array('files', 10), async (req, res) => {
  try {
    const gameId = req.params.gameId;
    req.files as Express.Multer.File[];

    // Vérifiez si le jeu existe
    const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'GameId not found in the database.' });
    }

    // Vérifier si des fichiers ont été uploadés
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    // Importer le modèle Image dynamiquement
    const { Image } = await import('./Image.js');
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
    const imageData: any[] = [];
    const fileData: any[] = [];

    // Séparer les images et les fichiers
    (req.files as Express.Multer.File[]).forEach((file: Express.Multer.File) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const isImage = imageExtensions.includes(fileExtension);

      const data = {
        filename: file.filename,
        filepath: file.path,
        fileType: fileExtension,
        fileSize: file.size,
        gameId: gameId
      };

      if (isImage) {
        imageData.push(data);
      } else {
        fileData.push(data);
      }
    });

    // Enregistrer les images et les fichiers dans leurs tables respectives
    const savedImages = imageData.length > 0 ? await Image.bulkCreate(imageData) : [];
    const savedFiles = fileData.length > 0 ? await FileUpload.bulkCreate(fileData) : [];

    res.status(201).json({
      message: 'Fichiers uploadés avec succès',
      images: savedImages,
      files: savedFiles
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload des fichiers:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
  }
});


// Routes pour récupérer les fichiers .exe (pas les images)
FileRoute.get('/file/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const parsedGameId = parseInt(gameId, 10);
    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: 'gameId invalide' });
    }

    // Rechercher le fichier dans la table Files
    const file = await FileUpload.findOne({ where: { gameId: parsedGameId } });

    if (!file) {
      return res.status(404).json({ error: 'Aucun fichier trouvé pour ce jeu' });
    }

    // Générer l'URL du fichier
    const fileUrl = `http://localhost:9091/uploads/${path.basename(file.dataValues.filepath)}`;
    res.json({ fileUrl });

  } catch (error) {
    console.error('Erreur lors de la récupération du fichier', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du fichier' });
  }
});


FileRoute.get('/files/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const parsedGameId = parseInt(gameId, 10);

    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: 'gameId invalide' });
    }

    // Rechercher tous les fichiers associés à ce gameId dans la table Files
    const files = await FileUpload.findAll({ where: { gameId: parsedGameId } });

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Aucun fichier trouvé pour ce jeu' });
    }

    // Générez les URLs des fichiers en fonction de leurs chemins
    const fileUrls = files.map(file => ({
      url:`http://localhost:9091/uploads/${path.basename(file.dataValues.filepath)}`
  }));

    res.json({ files: fileUrls });
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
  }
});




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
  req.file as Express.Multer.File
  try {
    if (!req.file || !gameId) {
      return res.status(400).json({ error: 'No File or No GameId' });
    }

    const gameResponse = await fetch(`http://localhost:9090/game/id/${gameId}`);
    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'GameId not found in the database.' });
    }

    const createdfile = await FileUpload.create({
      filename: req.file.filename,
      filepath: req.file.path,
      fileType: path.extname(req.file.originalname),
      fileSize: req.file.size,
      gameId: gameId
    });

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      file : createdfile,
      fileUrl: `http://localhost:9091/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur lors du téléversement', error);
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

    // Préparer les données pour `bulkCreate`
    const fileData =  (req.files as Express.Multer.File[]).map((file: Express.Multer.File)  => ({
      filename: file.filename,
      filepath: file.path,
      fileType: path.extname(file.originalname),
      fileSize: file.size,
      gameId: gameId
    }));

    // Enregistrez tous les fichiers avec bulkCreate
    const savedFiles = await FileUpload.bulkCreate(fileData);

    res.status(201).json({
      message: 'Fichiers uploadés avec succès',
      files: savedFiles
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload des fichiers:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
  }
});


FileRoute.get('/image/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const parsedGameId = parseInt(gameId, 10);
    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: 'gameId invalide' });
    }

    // Rechercher l'image dans la base de données
    const file = await FileUpload.findOne({ where: { gameId: parsedGameId } });

    if (!file) {
      return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
    }

    // Générer l'URL de l'image
    const fileUrl = `http://localhost:9091/uploads/${path.basename(file.dataValues.filepath)}`;
    res.json({ fileUrl });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'image' });
  }
});


FileRoute.get('/images/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    const parsedGameId = parseInt(gameId, 10);

    if (isNaN(parsedGameId)) {
      return res.status(400).json({ error: 'gameId invalide' });
    }

    // Rechercher tous les fichiers associés à ce gameId dans la base de données
    const files = await FileUpload.findAll({ where: { gameId: parsedGameId } });

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Aucune image trouvée pour ce jeu' });
    }

    // Générez les URLs des fichiers en fonction de leurs chemins
    const fileUrls = files.map(file => ({
      url:`http://localhost:9091/uploads/${path.basename(file.dataValues.filepath)}`
  }));

    res.json({ files: fileUrls });
  } catch (error) {
    console.error('Erreur lors de la récupération des images', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des images' });
  }
});




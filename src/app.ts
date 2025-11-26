import express from "express";
import cors from "cors";
import { FileRoute, FileUpload } from './Models/File.js';
import { ImageRoute, Image } from './Models/Image.js';
import path from "path";
import { upload } from "./config/multer.js";
import { sequelize } from './database.js';

const app = express();
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:9090'],  // Autorise le front-end et l'API boutique
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permet l'envoi des cookies/sessions
}));

// Routes
app.use('/game', FileRoute);
app.use('/game', ImageRoute);

// Mapping des fichiers vers les IDs de jeux
const gameMapping: Record<string, number> = {
  'BattleQuest.png': 1,
  'SurvivalIsland.png': 2, 
  'SpaceOdyssey.png': 3,
  'FantasyWarrior.png': 4,
  'CyberRunner.png': 5,
  'MysticRealm.png': 6,
  'ZombieApocalypse.png': 7,
  'OceanExplorer.png': 8,
  'RacingLegends.png': 9,
  'PuzzleMaster.png': 10
};

/**
 * Vérifier si toutes les images existent déjà dans la base de données
 */
async function checkImagesExist(): Promise<boolean> {
  try {
    // Import dynamique pour éviter les conflits
    const { Image } = await import('./Models/Image.js');
    const gameIds = Object.values(gameMapping);
    const imageCounts = await Promise.all(
      gameIds.map(async (gameId) => {
        const count = await Image.count({ where: { gameId } });
        return count > 0;
      })
    );
    
    // Vérifier si toutes les images existent (au moins une image par jeu)
    const allImagesExist = imageCounts.every(exists => exists);
    return allImagesExist;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des images:', error);
    return false;
  }
}

/**
 * Uploader un fichier
 */
async function uploadFile(filename: string, gameId: number) {
  // Imports dynamiques
  const fs = await import('fs');
  const axios = await import('axios');
  const FormData = (await import('form-data')).default;
  
  const assetsDir = path.join(__dirname, '../assets');
  const filePath = path.join(assetsDir, filename);
  const uploadURL = 'http://localhost:9091/game/upload/file';

  // Vérifier si le fichier existe
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Fichier ${filename} non trouvé dans ${assetsDir}`);
    return;
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('gameId', gameId.toString());

  try {
    const res = await axios.default.post(uploadURL, form, {
      headers: form.getHeaders()
    });
    console.log(`✅ ${filename} uploadé (gameId: ${gameId})`);
  } catch (err: any) {
    console.error(`❌ Erreur pour ${filename}:`, err.message);
  }
}

/**
 * Uploader toutes les images si elles n'existent pas
 */
async function uploadAssetsIfNeeded() {
  try {
    // Imports dynamiques
    const fs = await import('fs');
    const { Image } = await import('./Models/Image.js');
    
    console.log('🔍 Vérification des images existantes...');
    const imagesExist = await checkImagesExist();
    
    if (imagesExist) {
      console.log('✅ Toutes les images existent déjà, pas besoin d\'upload');
      return;
    }

    console.log('📤 Upload des images manquantes...');
    const assetsDir = path.join(__dirname, '../assets');
    
    // Vérifier si le dossier assets existe
    if (!fs.existsSync(assetsDir)) {
      console.warn(`⚠️ Dossier assets non trouvé: ${assetsDir}`);
      return;
    }

    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      const gameId = gameMapping[file];
      if (!gameId) {
        continue; // Ignorer les fichiers qui ne sont pas dans le mapping
      }
      
      // Vérifier si l'image existe déjà pour ce jeu
      const imageExists = await Image.count({ where: { gameId } }) > 0;
      if (!imageExists) {
        await uploadFile(file, gameId);
      }
    }
    
    console.log('✅ Upload des images terminé');
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload des assets:', error);
  }
}

// Démarre le serveur
app.listen(9091, async () => {
  console.log("Server on port 9091");
  
  // Attendre un peu que la base de données soit prête
  setTimeout(async () => {
    await uploadAssetsIfNeeded();
  }, 2000);
});

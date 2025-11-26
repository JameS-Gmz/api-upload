"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const File_js_1 = require("./Models/File.js");
const Image_js_1 = require("./Models/Image.js");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Configuration CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://localhost:9090'], // Autorise le front-end et l'API boutique
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Permet l'envoi des cookies/sessions
}));
// Routes
app.use('/game', File_js_1.FileRoute);
app.use('/game', Image_js_1.ImageRoute);
// Mapping des fichiers vers les IDs de jeux
const gameMapping = {
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
async function checkImagesExist() {
    try {
        // Import dynamique pour éviter les conflits
        const { Image } = await import('./Models/Image.js');
        const gameIds = Object.values(gameMapping);
        const imageCounts = await Promise.all(gameIds.map(async (gameId) => {
            const count = await Image.count({ where: { gameId } });
            return count > 0;
        }));
        // Vérifier si toutes les images existent (au moins une image par jeu)
        const allImagesExist = imageCounts.every(exists => exists);
        return allImagesExist;
    }
    catch (error) {
        console.error('❌ Erreur lors de la vérification des images:', error);
        return false;
    }
}
/**
 * Uploader un fichier
 */
async function uploadFile(filename, gameId) {
    // Imports dynamiques
    const fs = await import('fs');
    const axios = await import('axios');
    const FormData = (await import('form-data')).default;
    const assetsDir = path_1.default.join(__dirname, '../assets');
    const filePath = path_1.default.join(assetsDir, filename);
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
    }
    catch (err) {
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
        const assetsDir = path_1.default.join(__dirname, '../assets');
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
    }
    catch (error) {
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

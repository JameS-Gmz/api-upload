"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service de fichiers et images PlayForge (Express, port 9091).
 * Sert les uploads statiques, expose les routes Multer sous `/game`, et peut synchroniser le dossier `assets` avec la base locale.
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const File_js_1 = require("./Models/File.js");
const Image_js_1 = require("./Models/Image.js");
const path_1 = __importDefault(require("path"));
const database_js_1 = require("./database.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../assets')));
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://localhost:9090'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use('/game', File_js_1.FileRoute);
app.use('/game', Image_js_1.ImageRoute);
const GAME_API_URL = 'http://localhost:9090/game/AllGames';
let gameTitleToIdCache = null;
function normalizeGameKey(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Extrait un tableau de jeux depuis la réponse JSON (tableau brut ou objet enveloppant). */
function extractGamesArray(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        const o = payload;
        for (const key of ['games', 'data', 'items', 'results']) {
            const v = o[key];
            if (Array.isArray(v)) {
                return v;
            }
        }
    }
    return [];
}
/**
 * Construit la correspondance titre de jeu normalisé → identifiant numérique,
 * à partir de l’endpoint `GET /game/AllGames` de l’API principale (9090).
 * Plusieurs tentatives avec délai pour tolérer un démarrage asynchrone du serveur principal.
 * Si l’API répond 200 avec une liste vide (aucun jeu en base), retourne `{}` sans erreur.
 */
async function getGameTitleToIdMap(forceRefresh = false) {
    if (gameTitleToIdCache && !forceRefresh) {
        return gameTitleToIdCache;
    }
    let games = [];
    let lastStatus = null;
    let lastOkEmpty = false;
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await fetch(GAME_API_URL);
            lastStatus = response.status;
            if (!response.ok) {
                throw new Error(`Impossible de récupérer les jeux (${response.status})`);
            }
            const payload = await response.json();
            games = extractGamesArray(payload);
            if (games.length === 0) {
                lastOkEmpty = true;
            }
            if (games.length > 0) {
                break;
            }
        }
        catch (error) {
            lastError = error;
            lastOkEmpty = false;
        }
        await sleep(800);
    }
    if (games.length === 0) {
        if (lastOkEmpty && lastStatus === 200) {
            console.warn('⚠️ Aucun jeu dans l’API principale (GET /game/AllGames vide). Crée des jeux sur PlayForge ou lance api-Rest avec des données : synchronisation auto des assets ignorée.');
            gameTitleToIdCache = {};
            return {};
        }
        if (lastError) {
            throw lastError;
        }
        throw new Error(`Aucun jeu récupéré depuis l'API principale (status: ${lastStatus ?? 'inconnu'})`);
    }
    const map = {};
    for (const game of games) {
        if (!game?.title || !game?.id) {
            continue;
        }
        map[normalizeGameKey(String(game.title))] = Number(game.id);
    }
    if (Object.keys(map).length === 0 && games.length > 0) {
        console.warn('⚠️ Des jeux ont été reçus mais sans champs id/title exploitables pour le mapping titres → gameId.');
        gameTitleToIdCache = {};
        return {};
    }
    gameTitleToIdCache = map;
    return map;
}
function fileNameToGameTitle(fileName) {
    return normalizeGameKey(path_1.default.parse(fileName).name);
}
/**
 * Vérifier si toutes les images existent déjà dans la base de données
 */
async function checkImagesExist() {
    try {
        const { Image } = await import('./Models/Image.js');
        const gameMap = await getGameTitleToIdMap(true);
        const gameIds = Object.values(gameMap);
        if (gameIds.length === 0) {
            return false;
        }
        const imageCounts = await Promise.all(gameIds.map(async (gameId) => {
            const count = await Image.count({ where: { gameId } });
            return count > 0;
        }));
        const allImagesExist = imageCounts.every(exists => exists);
        return allImagesExist;
    }
    catch (error) {
        console.error('❌ Erreur lors de la vérification des images:', error);
        return false;
    }
}
/**
 * Envoie un fichier du répertoire `assets` vers la route locale `POST /game/upload/file` (même processus que le client distant).
 */
async function uploadFile(filename, gameId) {
    const fs = await import('fs');
    const axios = await import('axios');
    const FormData = (await import('form-data')).default;
    const assetsDir = path_1.default.join(__dirname, '../assets');
    const filePath = path_1.default.join(assetsDir, filename);
    const uploadURL = 'http://localhost:9091/game/upload/file';
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Fichier ${filename} non trouvé dans ${assetsDir}`);
        return;
    }
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('gameId', gameId.toString());
    try {
        await axios.default.post(uploadURL, form, {
            headers: form.getHeaders()
        });
        console.log(`✅ ${filename} uploadé (gameId: ${gameId})`);
    }
    catch (err) {
        console.error(`❌ Erreur pour ${filename}:`, err.message);
    }
}
/**
 * Parcourt `assets`, associe chaque fichier à un `gameId` via le titre normalisé, et déclenche un upload si aucune image n’existe pour ce jeu.
 */
async function uploadAssetsIfNeeded() {
    try {
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
        if (!fs.existsSync(assetsDir)) {
            console.warn(`⚠️ Dossier assets non trouvé: ${assetsDir}`);
            return;
        }
        const files = fs.readdirSync(assetsDir);
        const gameMap = await getGameTitleToIdMap();
        if (Object.keys(gameMap).length === 0) {
            console.log('ℹ️ Pas de jeux côté API principale : aucun upload automatique depuis assets.');
            return;
        }
        for (const file of files) {
            const gameTitle = fileNameToGameTitle(file);
            const gameId = gameMap[gameTitle];
            if (!gameId) {
                console.warn(`⚠️ Aucun gameId trouvé pour ${file} (titre attendu: "${gameTitle}")`);
                continue;
            }
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
app.listen(9091, async () => {
    console.log("Server on port 9091");
    try {
        await database_js_1.sequelize.authenticate();
        await database_js_1.sequelize.sync({ alter: true });
        console.log("✅ Base upload prête pour l'upload automatique");
    }
    catch (error) {
        console.error("❌ Impossible de préparer la base upload:", error);
    }
    await uploadAssetsIfNeeded();
});

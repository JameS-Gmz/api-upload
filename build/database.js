"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const promise_1 = __importDefault(require("mysql2/promise"));
// Paramètres DATABASE via Render (ou local)
// Base de données dédiée pour l'upload (images et fichiers)
const login = {
    database: process.env.DB_NAME || "Upload-PlayForge",
    username: process.env.DB_USER || "playAdmin2",
    password: process.env.DB_PASSWORD || "playAdmin2",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306
};
/**
 * Créer la base de données si elle n'existe pas
 */
async function ensureDatabaseExists() {
    // Se connecter sans spécifier de base de données
    const adminConnection = await promise_1.default.createConnection({
        host: login.host,
        port: login.port,
        user: login.username,
        password: login.password,
    });
    try {
        // Vérifier si la base de données existe
        const [databases] = await adminConnection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [login.database]);
        if (databases.length === 0) {
            // Créer la base de données
            await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${login.database}\``);
            console.log(`✅ Base de données '${login.database}' créée avec succès`);
        }
        else {
            console.log(`✅ Base de données '${login.database}' existe déjà`);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la vérification/création de la base de données:', error);
        throw error;
    }
    finally {
        await adminConnection.end();
    }
}
// Créer la base de données si nécessaire (fonction async auto-exécutée)
(async () => {
    try {
        await ensureDatabaseExists();
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de la base de données:', error);
    }
})();
exports.sequelize = new sequelize_1.Sequelize(login.database, login.username, login.password, {
    host: login.host,
    port: login.port,
    dialect: "mysql",
    logging: false
});
// Authentification
exports.sequelize.authenticate()
    .then(async () => {
    console.log(`✅ Connecté à la BDD : ${login.database}`);
    // Importer les modèles avant la synchronisation
    await import('./Models/File.js');
    await import('./Models/Image.js');
    // Synchronisation avec alter: true pour créer/ajouter les colonnes manquantes
    await exports.sequelize.sync({ alter: true });
    console.log("✅ Les modèles et les tables sont synchronisés");
})
    .catch((error) => {
    console.log("❌ Erreur de connexion ou synchronisation:", error);
});

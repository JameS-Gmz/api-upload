"use strict";
// 
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
// Paramètres DATABASE via Render (ou local)
const login = {
    database: process.env.DB_NAME || "Upload-PlayForge",
    username: process.env.DB_USER || "playAdmin2",
    password: process.env.DB_PASSWORD || "playAdmin2",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306
};
// ⚠️ SUPPRESSION de ensureDatabaseExists()
// Render ne permet PAS de créer une database, elle doit exister déjà.
exports.sequelize = new sequelize_1.Sequelize(login.database, login.username, login.password, {
    host: login.host,
    port: login.port,
    dialect: "mysql",
    logging: false
});
// Authentification
exports.sequelize.authenticate()
    .then(() => console.log(`✅ Connecté à la BDD : ${login.database}`))
    .catch((error) => {
    console.log("❌ Erreur de connexion:", error);
});
// Synchronisation
exports.sequelize.sync({ alter: false })
    .then(() => {
    console.log("✅ Les modèles et les tables sont synchronisés");
})
    .catch((error) => {
    console.log("❌ Erreur de synchronisation:", error);
});

/**
 * Connexion Sequelize (MySQL) pour la base dédiée au stockage des métadonnées fichiers / images.
 */
import { Sequelize } from "sequelize";
import mysql from 'mysql2/promise';

const login = {
    database: process.env.DB_NAME || "Upload-PlayForge",
    username: process.env.DB_USER || "playAdmin2",
    password: process.env.DB_PASSWORD || "playAdmin2",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306
};

async function ensureDatabaseExists() {
    const adminConnection = await mysql.createConnection({
        host: login.host,
        port: login.port,
        user: login.username,
        password: login.password,
    });

    try {
        const [databases] = await adminConnection.execute<mysql.RowDataPacket[]>(
            `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [login.database]
        );

        if (databases.length === 0) {
            await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${login.database}\``);
            console.log(`✅ Base de données '${login.database}' créée avec succès`);
        } else {
            console.log(`✅ Base de données '${login.database}' existe déjà`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification/création de la base de données:', error);
        throw error;
    } finally {
        await adminConnection.end();
    }
}

(async () => {
    try {
        await ensureDatabaseExists();
    } catch (error) {
        console.error('❌ Erreur lors de la création de la base de données:', error);
    }
})();

export const sequelize = new Sequelize(
    login.database,
    login.username,
    login.password,
    {
        host: login.host,
        port: login.port,
        dialect: "mysql",
        logging: false
    }
);

sequelize.authenticate()
    .then(async () => {
        console.log(`✅ Connecté à la BDD : ${login.database}`);

        await import('./Models/File.js');
        await import('./Models/Image.js');

        await sequelize.sync({ alter: true });
        console.log("✅ Les modèles et les tables sont synchronisés");
    })
    .catch((error: Error) => {
        console.log("❌ Erreur de connexion ou synchronisation:", error);
    });

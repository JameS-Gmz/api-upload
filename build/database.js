"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
// define tables
const login = {
    database: "Upload-PlayForge",
    username: "playAdmin2",
    password: "playAdmin2"
};
exports.sequelize = new sequelize_1.Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false //enleve les log de sequelize
});
exports.sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : PlayForge"))
    .catch((error) => console.log(error));
exports.sequelize.sync({ alter: false })
    .then(() => {
    console.log("Les modéles et les tables sont synchronisés");
})
    .catch((error) => console.log(error));

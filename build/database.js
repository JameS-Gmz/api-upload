
const sequelize = require("sequelize");
// define tables
const login = {
    database: "Upload-PlayForge",
    username: "playAdmin2",
    password: "playAdmin2"
};
exports.sequelize = new sequelize.Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false //enleve les log de sequelize
});
exports.sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : PlayForge"))
    .catch((error) => console.log(error));
exports.sequelize.sync({ force: true })
    .then(() => {
    console.log("Les modéles et les tables sont synchronisés");
})
    .catch((error) => console.log(error));

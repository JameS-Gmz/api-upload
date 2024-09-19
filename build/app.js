"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const File_js_1 = require("./Models/File.js");
const Image_js_1 = require("./Models/Image.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Configuration CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200', // Autorise uniquement l'origine de ton front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Permet l'envoi des cookies/sessions
}));
// Gère les pré-requêtes OPTIONS pour toutes les routes
app.options('*', (0, cors_1.default)());
// Routes
app.use('/game', File_js_1.FileRoute);
app.use('/game', Image_js_1.ImageRoute);
// Démarre le serveur
app.listen(9091, () => {
    console.log("Server on port 9091");
});

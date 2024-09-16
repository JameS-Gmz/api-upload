"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const File_js_1 = require("./Models/File.js");
const Image_js_1 = require("./Models/Image.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// error failed to fetch --> Cors head
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou spécifiez le domaine explicitement
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// routes
app.use('/game', File_js_1.FileRoute);
app.use('/game', Image_js_1.ImageRoute);
// Limit of the Post//
app.listen(9091, () => {
    console.log("Server on port 9090");
});

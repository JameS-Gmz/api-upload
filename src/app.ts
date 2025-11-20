import express from "express";
import cors from "cors";
import { FileRoute } from './Models/File.js';
import { ImageRoute } from './Models/Image.js';
import path from "path";
import { upload } from "./config/multer.js";

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

// Démarre le serveur
app.listen(9091, () => {
  console.log("Server on port 9091");
});

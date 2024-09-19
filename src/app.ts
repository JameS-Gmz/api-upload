import express from "express";
import cors from "cors";
import { FileRoute } from './Models/File.js';
import { ImageRoute } from './Models/Image.js';

const app = express();
app.use(express.json());

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:4200',  // Autorise uniquement l'origine de ton front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permet l'envoi des cookies/sessions
}));

// Gère les pré-requêtes OPTIONS pour toutes les routes
app.options('*', cors());

// Routes
app.use('/game', FileRoute);
app.use('/game', ImageRoute);

// Démarre le serveur
app.listen(9091, () => {
  console.log("Server on port 9091");
});

import { Request, Response } from 'express';
import express from "express";
import { FileRoute } from './Models/File.js';
import { ImageRoute } from './Models/Image.js';


const app = express();
app.use(express.json());


// error failed to fetch --> Cors head
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou spécifiez le domaine explicitement
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// routes
app.use('/file',FileRoute)
app.use('/image/',ImageRoute)

// Limit of the Post//
app.listen(9091, () => {
    console.log("Server on port 9090")
})
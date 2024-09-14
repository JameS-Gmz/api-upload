const multer = require('multer');
const path = require('path');

// Configuration du stockage avec Multer
export const storage = multer.diskStorage({
  destination: (req : Request, file : File, cb :any) => {
    cb(null, 'uploads/');  // Répertoire où stocker les fichiers
  },
  filename: (req : Request, file : any, cb :any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));  // Génère un nom unique
  }
});

// Filtrer les types de fichiers autorisés
export const fileFilter = (req : Request, file : any, cb :any) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|zip|exe/;  // Autoriser images, zip et exe
  const mimetype = allowedFileTypes.test(file.mimetype);  // Vérifier le mimetype

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers jpeg, jpg, png, gif, zip et exe sont autorisés'));
  }
};

// Initialiser Multer avec le filtre et la limite de taille (ici 100 Mo)
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },  // 100 Mo de limite de taille
  fileFilter: fileFilter
});


/**
 * Configuration Multer : stockage sur disque sous `uploads/`, filtre d’extensions et limite de taille (100 Mo).
 */
const multer = require('multer');
const path = require('path');

export const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req: Request, file:any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const fileFilter = (req: Request, file:any, cb: any) => {
  const allowedFileTypes = ['.jpeg', '.jpg', '.png', '.gif', '.zip', '.exe'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${fileExt}`), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: fileFilter
});


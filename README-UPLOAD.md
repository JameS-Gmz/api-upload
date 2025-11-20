# Upload API - Documentation test

## Overview

The Upload API is a dedicated service for handling file uploads (images, game executables) associated with games in the PlayForge platform. It runs on port **9091** and integrates with the main boutique API (port 9090) to validate game existence before processing uploads.

### Key Features

- **Single File Upload**: Upload individual files with game association
- **Multiple File Upload**: Batch upload up to 10 files per game
- **Game Validation**: Automatically verifies game existence via the boutique API
- **Static File Serving**: Serves uploaded files via `/uploads` endpoint
- **Asset Automation**: Script-based bulk upload from assets folder

### Architecture

The API uses **Sequelize ORM** with MySQL for file metadata storage. Files are physically stored in `src/uploads/` and served statically. The API validates game IDs by querying `http://localhost:9090/game/id/:gameId` before accepting uploads.

---

## Installation Tutorial

### Prerequisites

- Node.js (v18+)
- MySQL database
- Main boutique API running on port 9090

### Step 1: Install Dependencies

```bash
cd api-upload
npm install
```

### Step 2: Configure Database

Ensure your MySQL database is configured in `src/database.ts` with the same credentials as the boutique API.

### Step 3: Build the Project

```bash
npm run build
```

### Step 4: Start the Server

```bash
npm start
```

The server will start on **http://localhost:9091**

### Step 5: Upload Assets (Optional)

To bulk upload images from the `assets/` folder:

```bash
npm run upload-assets
```

This script automatically maps files to game IDs based on filename patterns.

---

## API Endpoints

### Upload Single File

```http
POST /game/upload/file
Content-Type: multipart/form-data

Body:
  - file: [File]
  - gameId: [number]
```

**Response:**
```json
{
  "message": "Fichier uploadé avec succès",
  "file": {
    "id": 1,
    "filename": "timestamp-random.ext",
    "filepath": "/path/to/file",
    "fileType": ".png",
    "fileSize": 12345,
    "gameId": 1
  },
  "fileUrl": "http://localhost:9091/upload/filename"
}
```

### Upload Multiple Files

```http
POST /game/upload/multiple/:gameId
Content-Type: multipart/form-data

Body:
  - files: [File[]] (max 10)
```

**Response:**
```json
{
  "message": "Fichiers uploadés avec succès",
  "files": [...]
}
```

### Get Single Image

```http
GET /game/image/:gameId
```

**Response:**
```json
{
  "fileUrl": "http://localhost:9091/uploads/filename.png"
}
```

### Get All Images for Game

```http
GET /game/images/:gameId
```

**Response:**
```json
{
  "files": [
    { "url": "http://localhost:9091/uploads/file1.png" },
    { "url": "http://localhost:9091/uploads/file2.png" }
  ]
}
```

### Access Uploaded Files

Files are served statically at:
```
http://localhost:9091/uploads/:filename
```

---

## Code Examples

### Upload File with JavaScript

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('gameId', '1');

fetch('http://localhost:9091/game/upload/file', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### Upload Multiple Files

```javascript
const formData = new FormData();
files.forEach(file => formData.append('files', file));

fetch('http://localhost:9091/game/upload/multiple/1', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### Retrieve Game Images

```javascript
fetch('http://localhost:9091/game/images/1')
  .then(res => res.json())
  .then(data => {
    data.files.forEach(file => {
      console.log(file.url);
    });
  });
```

---

## Asset Mapping

The `upload-assets` script maps filenames to game IDs:

| Filename | Game ID | Game Name |
|----------|---------|-----------|
| BattleQuest.png | 1 | Battle Quest |
| SurvivalIsland.png | 2 | Survival Island |
| SpaceOdyssey.png | 3 | Space Odyssey |
| FantasyWarrior.png | 4 | Fantasy Warriors |
| CyberRunner.png | 5 | Cyber Runner |
| MysticRealm.png | 6 | Mystic Realm |
| ZombieApocalypse.png | 7 | Zombie Apocalypse |
| OceanExplorer.png | 8 | Ocean Explorer |
| RacingLegends.png | 9 | Racing Legends |
| PuzzleMaster.png | 10 | Puzzle Master |

---

## Troubleshooting

### Error: "GameId not found in the database"
- Ensure the boutique API is running on port 9090
- Verify the game exists before uploading files

### Error: "No File or No GameId"
- Check that both `file` and `gameId` are provided in the request

### Files not accessible via URL
- Verify the `src/uploads/` directory exists
- Check file permissions
- Ensure the static file serving is configured correctly

### CORS Errors
- Verify CORS configuration in `src/app.ts` includes your frontend origin

---

## Development Commands

```bash
# Build TypeScript
npm run build

# Start server (with watch)
npm start

# Development mode
npm run dev

# Upload all assets
npm run upload-assets
```

---

## File Structure

```
api-upload/
├── src/
│   ├── app.ts              # Main server file
│   ├── database.ts         # Database configuration
│   ├── config/
│   │   └── multer.ts       # File upload configuration
│   ├── Models/
│   │   ├── File.ts         # File routes & model
│   │   └── Image.ts        # Image routes & model
│   └── uploads/            # Uploaded files storage
├── assets/                  # Source images for bulk upload
├── initialization/
│   └── upload-assets.ts    # Bulk upload script
└── package.json
```

---

## Notes

- The API validates game existence before accepting uploads
- Files are renamed with timestamps to prevent conflicts
- Maximum 10 files per batch upload
- Supported file types: images, executables, and other game assets
- Files are stored permanently until manually deleted

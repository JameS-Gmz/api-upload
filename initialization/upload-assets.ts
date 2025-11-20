import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { error } from 'console';

const assetsDir = path.join(__dirname, '../assets');
const uploadURL = 'http://localhost:9091/game/upload/file';

const gameMapping: Record<string, number> = {
  'BattleQuest.png': 1,
  'SurvivalIsland.png': 2, 
  'SpaceOdyssey.png': 3,
  'FantasyWarrior.png': 4,
  'CyberRunner.png': 5,
  'MysticRealm.png': 6,
  'ZombieApocalypse.png': 7,
  'OceanExplorer.png': 8,
  'RacingLegends.png': 9,
  'PuzzleMaster.png': 10
};

async function uploadFile(filename: string, gameId: number) {
  const filePath = path.join(assetsDir, filename);
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('gameId', gameId.toString());

  try {
    const res = await axios.post(uploadURL, form, {
      headers: form.getHeaders()
    });
    console.log(`✅ ${filename} uploadé (gameId: ${gameId})`);
  } catch (err: any) {
    console.error(`❌ Erreur pour ${filename}:`);
    console.dir(err, { depth: null });
  }
}

async function main() {
  const files = fs.readdirSync(assetsDir);
  for (const file of files) {
    const gameId = gameMapping[file];
    if (!gameId) {
      console.warn(`⚠️ Aucune correspondance pour ${file}`);
      continue;
    }
    await uploadFile(file, gameId);
  }
}

main();

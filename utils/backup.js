import fs from "fs";
import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

const DATA_FILES = [
  "data/users.json",
  "data/userStats.json",
  "data/globalStats.json",
  "data/config.json"
];

export async function criarBackup() {
  if (!fs.existsSync("backup")) {
    fs.mkdirSync("backup");
  }

  // BACKUP DOS JSON LOCAIS
  for (const file of DATA_FILES) {
    if (fs.existsSync(file)) {
      const conteudo = fs.readFileSync(file, "utf8");
      const nome = file.replace("data/", "");

      const tempPath = `backup/${nome}.tmp`;
      const finalPath = `backup/${nome}`;

      fs.writeFileSync(tempPath, conteudo);
      fs.renameSync(tempPath, finalPath);
    }
  }

  // BACKUP DO MONGODB — USERGAMES
  const userGamesData = await UserGames.find().lean();
  fs.writeFileSync("backup/userGames.json.tmp", JSON.stringify(userGamesData, null, 2));
  fs.renameSync("backup/userGames.json.tmp", "backup/userGames.json");

  // BACKUP DO MONGODB — USERSTATS
  const userStatsData = await UserStats.find().lean();
  fs.writeFileSync("backup/userStatsMongo.json.tmp", JSON.stringify(userStatsData, null, 2));
  fs.renameSync("backup/userStatsMongo.json.tmp", "backup/userStatsMongo.json");
}

export function restaurarBackup() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  for (const file of DATA_FILES) {
    const nome = file.replace("data/", "");
    const backupPath = `backup/${nome}`;

    if (fs.existsSync(backupPath) && !fs.existsSync(file)) {
      const conteudo = fs.readFileSync(backupPath, "utf8");
      const tempPath = `${file}.tmp`;

      fs.writeFileSync(tempPath, conteudo);
      fs.renameSync(tempPath, file);
    }
  }

  // MongoDB NÃO é restaurado automaticamente
  // porque seria perigoso sobrescrever coleções inteiras.
}

import fs from "fs";
import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";

const CONFIG_FILE = "data/config.json";

export async function criarBackup() {
  if (!fs.existsSync("backup")) {
    fs.mkdirSync("backup");
  }

  // Configuração local
  if (fs.existsSync(CONFIG_FILE)) {
    const conteudo = fs.readFileSync(CONFIG_FILE, "utf8");
    fs.writeFileSync("backup/config.json.tmp", conteudo);
    fs.renameSync("backup/config.json.tmp", "backup/config.json");
  }

  // MongoDB
  const [userGamesData, userStatsData, globalStatsData] = await Promise.all([
    UserGames.find().lean(),
    UserStats.find().lean(),
    GlobalStats.find().lean()
  ]);

  fs.writeFileSync("backup/userGames.json.tmp", JSON.stringify(userGamesData, null, 2));
  fs.renameSync("backup/userGames.json.tmp", "backup/userGames.json");

  fs.writeFileSync("backup/userStatsMongo.json.tmp", JSON.stringify(userStatsData, null, 2));
  fs.renameSync("backup/userStatsMongo.json.tmp", "backup/userStatsMongo.json");

  fs.writeFileSync("backup/globalStatsMongo.json.tmp", JSON.stringify(globalStatsData, null, 2));
  fs.renameSync("backup/globalStatsMongo.json.tmp", "backup/globalStatsMongo.json");
}

export function restaurarBackup() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  if (!fs.existsSync(CONFIG_FILE) && fs.existsSync("backup/config.json")) {
    const conteudo = fs.readFileSync("backup/config.json", "utf8");
    fs.writeFileSync("data/config.json.tmp", conteudo);
    fs.renameSync("data/config.json.tmp", CONFIG_FILE);
  }

  // MongoDB não é restaurado automaticamente para evitar sobrescrever coleções inteiras.
}

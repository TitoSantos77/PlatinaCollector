import fs from "fs";
import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";
import BotConfig from "../models/BotConfig.js";
import PremiosConfig from "../models/PremiosConfig.js";
import PremioRegisto from "../models/PremioRegisto.js";
import PremioEvento from "../models/PremioEvento.js";

export async function criarBackup() {
  if (!fs.existsSync("backup")) {
    fs.mkdirSync("backup");
  }

  const [
    userGamesData,
    userStatsData,
    globalStatsData,
    botConfigData,
    premiosConfigData,
    premioRegistoData,
    premioEventoData
  ] = await Promise.all([
    UserGames.find().lean(),
    UserStats.find().lean(),
    GlobalStats.find().lean(),
    BotConfig.find().lean(),
    PremiosConfig.find().lean(),
    PremioRegisto.find().lean(),
    PremioEvento.find().lean()
  ]);

  fs.writeFileSync("backup/userGames.json.tmp", JSON.stringify(userGamesData, null, 2));
  fs.renameSync("backup/userGames.json.tmp", "backup/userGames.json");

  fs.writeFileSync("backup/userStatsMongo.json.tmp", JSON.stringify(userStatsData, null, 2));
  fs.renameSync("backup/userStatsMongo.json.tmp", "backup/userStatsMongo.json");

  fs.writeFileSync("backup/globalStatsMongo.json.tmp", JSON.stringify(globalStatsData, null, 2));
  fs.renameSync("backup/globalStatsMongo.json.tmp", "backup/globalStatsMongo.json");

  fs.writeFileSync("backup/botConfigMongo.json.tmp", JSON.stringify(botConfigData, null, 2));
  fs.renameSync("backup/botConfigMongo.json.tmp", "backup/botConfigMongo.json");

  fs.writeFileSync("backup/premiosConfigMongo.json.tmp", JSON.stringify(premiosConfigData, null, 2));
  fs.renameSync("backup/premiosConfigMongo.json.tmp", "backup/premiosConfigMongo.json");

  fs.writeFileSync("backup/premioRegistoMongo.json.tmp", JSON.stringify(premioRegistoData, null, 2));
  fs.renameSync("backup/premioRegistoMongo.json.tmp", "backup/premioRegistoMongo.json");

  fs.writeFileSync("backup/premioEventoMongo.json.tmp", JSON.stringify(premioEventoData, null, 2));
  fs.renameSync("backup/premioEventoMongo.json.tmp", "backup/premioEventoMongo.json");
}

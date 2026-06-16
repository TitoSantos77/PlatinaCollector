import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// 🔵 FAKE SERVER PARA O RENDER
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("PlatinaCollector is running"));
app.listen(process.env.PORT || 10000, () =>
  console.log("Fake server ativo na porta " + (process.env.PORT || 10000))
);

// 🔵 MONGODB
import mongoose from "mongoose";

// 🔵 LIGAR AO MONGODB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("📦 MongoDB conectado!");
}).catch(err => {
  console.error("❌ Erro ao ligar ao MongoDB:", err);
});

// 🔵 IMPORTAR BACKUP
import { restaurarBackup, criarBackup } from "./utils/backup.js";

// 🔵 RESTAURAR BACKUP ANTES DE LER CONFIG
restaurarBackup();

// IMPORTAR O SCHEDULER
import { iniciarSchedulerMissoes } from "./scheduler/missoesScheduler.js";

// IMPORTAR CONFIG DA PASTA /data (AGORA JÁ RESTAURADA)
let config = JSON.parse(fs.readFileSync("./data/config.json", "utf8"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Coleção de comandos
client.commands = new Collection();

// Carregar comandos da pasta /commands
const commandsPath

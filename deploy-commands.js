console.log("🚀 DEPLOY-COMMANDS.JS INICIADO");

import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "10" }).setToken(TOKEN);

// 1️⃣ APAGAR TODOS OS COMANDOS ANTIGOS
console.log("🗑️ A limpar comandos antigos...");
await rest.put(
  Routes.applicationCommands(CLIENT_ID),
  { body: [] }
);
console.log("✔️ Comandos antigos apagados!");

// 2️⃣ CARREGAR COMANDOS NOVOS
const commands = [];
const commandsPath = path.join(process.cwd(), "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  }
}

console.log("🔄 A registar comandos novos...");
await rest.put(
  Routes.applicationCommands(CLIENT_ID),
  { body: commands }
);

console.log("✔️ Comandos registados com sucesso!");

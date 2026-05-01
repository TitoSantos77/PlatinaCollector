import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function limpar() {
  try {
    console.log("🧹 A limpar comandos globais...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log("✔ Comandos globais apagados!");
  } catch (err) {
    console.error("❌ Erro ao limpar globais:", err);
  }
}

limpar();

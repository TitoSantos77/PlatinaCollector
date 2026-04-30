import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // tens de meter o ID do teu servidor

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function resetGuild() {
  try {
    console.log("🗑️ A limpar comandos do servidor...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log("✔️ Comandos do servidor apagados!");
  } catch (error) {
    console.error(error);
  }
}

resetGuild();

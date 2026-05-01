import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const commands = [];
const commandsPath = path.join(process.cwd(), "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`⚠️ O comando ${file} está mal formatado.`);
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log("🔄 A atualizar comandos...");

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );

  console.log("✔ Comandos atualizados com sucesso!");
} catch (error) {
  console.error(error);
}

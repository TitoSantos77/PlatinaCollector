import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export const data = new SlashCommandBuilder()
  .setName("setcanal")
  .setDescription("Define o canal onde o bot pode ser usado.")
  .addChannelOption(option =>
    option
      .setName("canal")
      .setDescription("Escolhe o canal permitido")
      .setRequired(true)
  );

export async function execute(interaction) {
  const canal = interaction.options.getChannel("canal");

  const configPath = path.join(process.cwd(), "data", "config.json");

  const config = { allowedChannel: canal.id };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  await interaction.reply(`✔ Canal definido para: <#${canal.id}>`);
}

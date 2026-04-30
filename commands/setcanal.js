import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export const data = new SlashCommandBuilder()
  .setName("setcanal")
  .setDescription("Adiciona um canal onde o bot pode ser usado.")
  .addChannelOption(option =>
    option
      .setName("canal")
      .setDescription("Escolhe o canal permitido")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator); // Só admins

export async function execute(interaction) {
  // Verificação extra (caso o Discord falhe)
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const canal = interaction.options.getChannel("canal");

  const configPath = path.join(process.cwd(), "data", "config.json");

  // Ler config atual
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  // Garantir que existe a lista
  if (!Array.isArray(config.allowedChannels)) {
    config.allowedChannels = [];
  }

  // Adicionar canal se ainda não existir
  if (!config.allowedChannels.includes(canal.id)) {
    config.allowedChannels.push(canal.id);
  }

  // Guardar
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  await interaction.reply(`✔ Canal adicionado à lista: <#${canal.id}>`);
}

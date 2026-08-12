import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import BotConfig from "../models/BotConfig.js";

export const data = new SlashCommandBuilder()
  .setName("setcanal")
  .setDescription("Adiciona um canal onde o bot pode ser usado.")
  .addChannelOption(option =>
    option
      .setName("canal")
      .setDescription("Escolhe o canal permitido")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const canal = interaction.options.getChannel("canal");

  const config = await BotConfig.findOneAndUpdate(
    { chave: "principal" },
    { $addToSet: { allowedChannels: canal.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const canais = config.allowedChannels.map(id => `<#${id}>`).join(", ");

  await interaction.reply(
    `✔ Canal adicionado à lista: <#${canal.id}>\n📌 Canais permitidos: ${canais}`
  );
}

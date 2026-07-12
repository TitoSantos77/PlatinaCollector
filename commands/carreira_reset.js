import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("carreira_reset")
  .setDescription("Apaga TODO o histórico da carreira GTA de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt =>
    opt
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const user = interaction.options.getUser("user");
  const userId = user.id;

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  if (!games) {
    return interaction.reply({
      content: "❌ Este utilizador não tem UserGames.",
      ephemeral: true
    });
  }

  // APAGAR TODA A CARREIRA GTA
  games.carreira = [];
  await games.save();

  // LIMPAR ÚLTIMA CARREIRA DO USERSTATS
  if (stats) {
    stats.ultimaCarreira = null;
    await stats.save();
  }

  return interaction.reply({
    content: `🗑 Histórico COMPLETO da carreira GTA de **${user.username}** foi apagado.`,
    ephemeral: false
  });
}

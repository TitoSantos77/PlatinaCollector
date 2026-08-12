import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

import User from "../models/User.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";
import UserGames from "../models/UserGames.js";

import { criarBackup } from "../utils/backup.js";

export const data = new SlashCommandBuilder()
  .setName("resetall")
  .setDescription("⚠️ APAGA TODOS OS DADOS DE TODOS OS UTILIZADORES")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  await User.deleteMany({});
  await UserStats.deleteMany({});
  await GlobalStats.deleteMany({});
  await UserGames.deleteMany({});

  criarBackup();

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("💣 RESET GLOBAL COMPLETO")
    .setDescription(
      "Todos os dados de **todos os utilizadores** foram apagados:\n\n" +
      "• XP e níveis\n" +
      "• Platinas\n" +
      "• Proezas antigas\n" +
      "• Carreira GTA\n" +
      "• Estatísticas globais\n" +
      "• Histórico completo\n\n" +
      "⚠️ Esta ação é permanente."
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

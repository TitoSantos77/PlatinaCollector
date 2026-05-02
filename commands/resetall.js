import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

// MODELS DO MONGO
import User from "../models/User.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";
import UserGames from "../models/UserGames.js"; // <-- ADICIONADO

// BACKUP
import { criarBackup } from "../utils/backup.js";

export const data = new SlashCommandBuilder()
  .setName("resetall")
  .setDescription("⚠️ APAGA TODOS OS DADOS DE TODOS OS UTILIZADORES (XP, badges, platinas, tudo)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  // APAGAR TODAS AS COLEÇÕES DO MONGO
  await User.deleteMany({});
  await UserStats.deleteMany({});
  await GlobalStats.deleteMany({});
  await UserGames.deleteMany({}); // <-- ADICIONADO

  // CRIAR BACKUP DEPOIS DO RESET GLOBAL
  criarBackup();

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("💣 RESET GLOBAL COMPLETO")
    .setDescription(
      "Todos os dados de **todos os utilizadores** foram apagados:\n\n" +
      "• XP e níveis\n" +
      "• Badges\n" +
      "• Platinas\n" +
      "• Conquistas\n" +
      "• Estatísticas globais\n" +
      "• Histórico completo\n\n" +
      "⚠️ Esta ação é permanente."
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { writeJSON } from "../utils/database.js";

// 🔵 IMPORTAR BACKUP
import { criarBackup } from "../utils/backup.js";

export const data = new SlashCommandBuilder()
  .setName("resetall")
  .setDescription("⚠️ APAGA TODOS OS DADOS DE TODOS OS UTILIZADORES (XP, badges, platinas, tudo)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  // Segurança extra
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  // Limpar todos os ficheiros
  writeJSON("data/users.json", {});
  writeJSON("data/missions.json", {});
  writeJSON("data/userStats.json", {});
  writeJSON("data/globalStats.json", {}); // se não quiseres limpar isto, diz

  // 🔵 CRIAR BACKUP DEPOIS DO RESET GLOBAL
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
      "• Missões\n" +
      "• Estatísticas\n\n" +
      "⚠️ Esta ação é permanente."
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

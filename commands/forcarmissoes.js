import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { readJSON, writeJSON } from "../utils/database.js";
import { gerarMissao } from "../utils/missions.js";

export const data = new SlashCommandBuilder()
  .setName("forcarmissoes")
  .setDescription("⚠️ Gera missões semanais imediatamente para todos os utilizadores")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  try {
    const users = readJSON("data/users.json");
    const meta = readJSON("data/meta.json") || {};

    for (const userId of Object.keys(users)) {
      gerarMissao(userId);
    }

    // Atualiza meta para evitar conflito com a terça-feira
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const semana = Math.floor((hoje - new Date(ano, 0, 1)) / (1000 * 60 * 60 * 24 * 7));
    meta.ultimaSemanaGerada = `${ano}-${semana}`;
    writeJSON("data/meta.json", meta);

    const embed = new EmbedBuilder()
      .setColor("#00CC88")
      .setTitle("📘 Missões Geradas Manualmente")
      .setDescription("Todas as missões semanais foram geradas com sucesso para todos os utilizadores.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Ocorreu um erro ao gerar as missões.",
      ephemeral: true
    });
  }
}

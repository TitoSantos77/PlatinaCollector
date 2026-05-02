import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
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
    // Buscar todos os users registados no Mongo
    const users = await UserStats.find().lean();

    for (const user of users) {
      await gerarMissao(user.userId); // AGORA USA O SISTEMA NOVO
    }

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

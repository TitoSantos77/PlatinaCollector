import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o top 10 do ranking por XP total");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar todos os users do Mongo
  const users = await UserStats.find().lean();

  if (!users || users.length === 0) {
    return interaction.reply({
      content: "❌ Ainda não há jogadores suficientes para criar um ranking.",
      ephemeral: true
    });
  }

  // Ordenar por XP total
  const lista = users
    .map(u => ({
      id: u.userId,
      xp: u.totalXP || 0,
      nivel: u.nivel || 1
    }))
    .sort((a, b) => b.xp - a.xp);

  // Top 10
  const top10 = lista.slice(0, 10);

  // Medalhas
  const medalhas = ["🥇", "🥈", "🥉"];

  const linhas = top10
    .map((u, i) => {
      const medalha = medalhas[i] || `#${i + 1}`;
      const destaque = u.id === userId ? " **(TU)**" : "";
      const xpFormatado = u.xp.toLocaleString("pt-PT");
      return `${medalha} — <@${u.id}> — ${xpFormatado} XP (Nível ${u.nivel})${destaque}`;
    })
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏆 Top 10 — Ranking Geral de XP")
    .setDescription(linhas)
    .setFooter({ text: "Ranking baseado no XP total acumulado" })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

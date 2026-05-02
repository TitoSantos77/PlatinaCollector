import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o top 10 do ranking por XP total");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar todos os users do Mongo (AGORA CORRETO)
  const users = await UserStats.find().lean();

  // Converter em lista ordenada
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
      return `${medalha} — <@${u.id}> — ${u.xp} XP (Nível ${u.nivel})`;
    })
    .join("\n");

  // Embed (mantive o teu estilo)
  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏆 Top 10 Ranking Geral")
    .setDescription(linhas)
    .setFooter({ text: "Ranking baseado no XP total acumulado" });

  await interaction.reply({ embeds: [embed] });
}

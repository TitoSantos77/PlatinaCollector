import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../models/User.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o top 10 do ranking por XP total");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar todos os users do Mongo
  const users = await User.find().lean();

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
      return `${medalha} — <@${u.id}> — **${u.xp} XP** (Nível ${u.nivel})`;
    })
    .join("\n");

  // Posição do user
  const posicaoUser = lista.findIndex(u => u.id === userId) + 1;
  const userData = lista.find(u => u.id === userId);

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏆 TOP 10 — Ranking por XP Total")
    .setDescription(linhas || "Ainda não há jogadores no ranking.")
    .setFooter({ text: "Continua a competir!" });

  // Se o user estiver fora do top 10, mostrar posição dele
  if (posicaoUser > 10) {
    embed.addFields({
      name: "A tua posição",
      value: `#${posicaoUser} — **${userData?.xp || 0} XP** (Nível ${userData?.nivel || 1})`
    });
  }

  await interaction.reply({ embeds: [embed] });
}

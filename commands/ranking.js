import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o top 10 do ranking por XP total");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Carregar XP total dos users
  const users = readJSON("data/users.json");

  // Converter users em array
  const lista = Object.entries(users).map(([id, dados]) => ({
    id,
    xp: dados.totalXP || 0
  }));

  // Ordenar por XP total
  lista.sort((a, b) => b.xp - a.xp);

  // Top 10
  const top10 = lista.slice(0, 10);

  const linhas = top10
    .map((u, i) => `**#${i + 1}** — <@${u.id}> — **${u.xp} XP**`)
    .join("\n");

  // Posição do user
  const posicaoUser = lista.findIndex(u => u.id === userId) + 1;
  const xpUser = lista.find(u => u.id === userId)?.xp || 0;

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏆 TOP 10 — Ranking por XP Total")
    .setDescription(linhas || "Ainda não há jogadores no ranking.")
    .setFooter({ text: "Continua a competir!" });

  // Se o user estiver fora do top 10, mostrar posição dele
  if (posicaoUser > 10) {
    embed.addFields({
      name: "A tua posição",
      value: `#${posicaoUser} — **${xpUser} XP**`
    });
  }

  await interaction.reply({ embeds: [embed] });
}

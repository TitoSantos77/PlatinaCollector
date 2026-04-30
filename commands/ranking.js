import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o top 10 do ranking");

export async function execute(interaction) {
  const userId = interaction.user.id;

  const stats = readJSON("data/userStats.json");

  const lista = Object.entries(stats).map(([id, dados]) => ({
    id,
    pontos: dados.platinas + dados.conquistas
  }));

  lista.sort((a, b) => b.pontos - a.pontos);

  const top10 = lista.slice(0, 10);

  const linhas = top10
    .map((u, i) => `**#${i + 1}** — <@${u.id}> — **${u.pontos} pts**`)
    .join("\n");

  const posicaoUser = lista.findIndex(u => u.id === userId) + 1;
  const pontosUser = lista.find(u => u.id === userId)?.pontos || 0;

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏆 TOP 10 — Ranking Geral")
    .setDescription(linhas || "Ainda não há jogadores no ranking.")
    .setFooter({ text: "Continua a competir!" });

  // Se o user estiver fora do top 10, mostrar posição dele
  if (posicaoUser > 10) {
    embed.addFields({
      name: "A tua posição",
      value: `#${posicaoUser} — **${pontosUser} pts**`
    });
  }

  await interaction.reply({ embeds: [embed] });
}

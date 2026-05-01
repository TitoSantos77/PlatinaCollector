import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";
import { getUserStats } from "../utils/userStats.js";

export const data = new SlashCommandBuilder()
  .setName("perfil")
  .setDescription("Mostra o teu perfil de jogador");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Ler dados do user (XP, nível, badge)
  const users = readJSON("data/users.json");
  const userXP = users[userId] || { nivel: 1, totalXP: 0, badge: "⚪ Iniciante" };

  const nivel = userXP.nivel || 1;
  const totalXP = userXP.totalXP || 0;
  const badge = userXP.badge || "⚪ Iniciante";

  // Estatísticas do user (platinas, conquistas, últimas) — AGORA COM AWAIT
  const stats = await getUserStats(userId);

  const platinas = stats.platinas ?? 0;
  const conquistas = stats.conquistas ?? 0;

  const ultimaPlatinaTexto = stats.ultimaPlatina?.jogo
    ? `${stats.ultimaPlatina.jogo}${stats.ultimaPlatina.plataforma ? ` (${stats.ultimaPlatina.plataforma})` : ""}`
    : "Nenhuma ainda";

  const ultimaConquistaTexto = stats.ultimaConquista?.jogo
    ? `${stats.ultimaConquista.jogo}${stats.ultimaConquista.plataforma ? ` (${stats.ultimaConquista.plataforma})` : ""}`
    : "Nenhuma ainda";

  const embed = new EmbedBuilder()
    .setColor("#0055FF")
    .setTitle("🎮 Perfil do Jogador")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "👤 Jogador", value: interaction.user.username, inline: true },
      { name: "🏅 Nível", value: `${nivel}`, inline: true },
      { name: "🔰 Badge", value: badge, inline: true },

      { name: "✨ XP Total", value: `${totalXP} XP`, inline: true },
      { name: "🏆 Platinas", value: `${platinas}`, inline: true },
      { name: "🥇 Conquistas", value: `${conquistas}`, inline: true },

      { name: "Última Platina", value: ultimaPlatinaTexto, inline: false },
      { name: "Última Conquista", value: ultimaConquistaTexto, inline: false }
    )
    .setFooter({ text: "Continua a evoluir, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

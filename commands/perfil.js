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

  // Estatísticas do user (platinas, conquistas, últimas)
  const stats = getUserStats(userId);

  const ultimaPlatinaTexto = stats.ultimaPlatina
    ? `${stats.ultimaPlatina.jogo}${stats.ultimaPlatina.plataforma ? ` (${stats.ultimaPlatina.plataforma})` : ""}`
    : "Nenhuma ainda";

  const ultimaConquistaTexto = stats.ultimaConquista
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
      { name: "🏆 Platinas", value: `${stats.platinas}`, inline: true },
      { name: "🏅 Conquistas", value: `${stats.conquistas}`, inline: true },

      { name: "Última Platina", value: ultimaPlatinaTexto, inline: false },
      { name: "Última Conquista", value: ultimaConquistaTexto, inline: false }
    )
    .setFooter({ text: "Continua a evoluir, lenda!" });

  // Mostrar imagens (platina e conquista)
  // Se tiver as duas → mostra as duas
  if (stats.ultimaPlatinaImagem && stats.ultimaConquistaImagem) {
    embed.addFields({ name: "📸 Prova da Última Platina", value: " " });
    embed.setImage(stats.ultimaPlatinaImagem);

    embed.addFields({ name: "📸 Prova da Última Conquista", value: " " });
    embed.addFields({ name: " ", value: `[Clique aqui para ver a imagem](${stats.ultimaConquistaImagem})` });
  }

  // Se tiver só platina
  else if (stats.ultimaPlatinaImagem) {
    embed.addFields({ name: "📸 Prova da Última Platina", value: " " });
    embed.setImage(stats.ultimaPlatinaImagem);
  }

  // Se tiver só conquista
  else if (stats.ultimaConquistaImagem) {
    embed.addFields({ name: "📸 Prova da Última Conquista", value: " " });
    embed.setImage(stats.ultimaConquistaImagem);
  }

  await interaction.reply({ embeds: [embed] });
}

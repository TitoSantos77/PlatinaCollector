import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("estatisticas")
  .setDescription("Mostra estatísticas gerais do servidor (XP total, jogos mais feitos, etc)");

export async function execute(interaction) {
  const users = readJSON("data/users.json");
  const stats = readJSON("data/userStats.json");
  const globalStats = readJSON("data/globalStats.json");

  // Total de jogadores
  const totalJogadores = Object.keys(users).length;

  // Total de XP do servidor
  const totalXP = Object.values(users)
    .reduce((acc, u) => acc + (u.totalXP || 0), 0);

  // Total de platinas
  const totalPlatinas = Object.values(stats)
    .reduce((acc, u) => acc + (u.platinas || 0), 0);

  // Total de conquistas
  const totalConquistas = Object.values(stats)
    .reduce((acc, u) => acc + (u.conquistas || 0), 0);

  // Jogo mais platinado
  let jogoMaisFeito = "Nenhum";
  if (globalStats.jogos && Object.keys(globalStats.jogos).length > 0) {
    jogoMaisFeito = Object.entries(globalStats.jogos)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // Plataforma mais usada
  let plataformaMaisUsada = "Nenhuma";
  if (globalStats.plataformas && Object.keys(globalStats.plataformas).length > 0) {
    plataformaMaisUsada = Object.entries(globalStats.plataformas)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // User com mais XP
  let topXP = "Nenhum";
  if (Object.keys(users).length > 0) {
    const sortedXP = Object.entries(users)
      .sort((a, b) => (b[1].totalXP || 0) - (a[1].totalXP || 0));
    topXP = `<@${sortedXP[0][0]}> (${sortedXP[0][1].totalXP} XP)`;
  }

  // User com mais platinas
  let topPlatinas = "Nenhum";
  if (Object.keys(stats).length > 0) {
    const sortedPlatinas = Object.entries(stats)
      .sort((a, b) => (b[1].platinas || 0) - (a[1].platinas || 0));
    topPlatinas = `<@${sortedPlatinas[0][0]}> (${sortedPlatinas[0][1].platinas} platinas)`;
  }

  // User com mais conquistas
  let topConquistas = "Nenhum";
  if (Object.keys(stats).length > 0) {
    const sortedConquistas = Object.entries(stats)
      .sort((a, b) => (b[1].conquistas || 0) - (a[1].conquistas || 0));
    topConquistas = `<@${sortedConquistas[0][0]}> (${sortedConquistas[0][1].conquistas} conquistas)`;
  }

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("📊 Estatísticas Gerais do Servidor")
    .addFields(
      { name: "👥 Jogadores Registados", value: `${totalJogadores}`, inline: true },
      { name: "⭐ XP Total do Servidor", value: `${totalXP} XP`, inline: true },
      { name: "🏆 Total de Platinas", value: `${totalPlatinas}`, inline: true },
      { name: "🎖️ Total de Conquistas", value: `${totalConquistas}`, inline: true },
      { name: "🔥 Jogo Mais Platinado", value: jogoMaisFeito, inline: true },
      { name: "💿 Plataforma Mais Usada", value: plataformaMaisUsada, inline: true },
      { name: "👑 User com Mais XP", value: topXP, inline: false },
      { name: "🏅 User com Mais Platinas", value: topPlatinas, inline: false },
      { name: "🥇 User com Mais Conquistas", value: topConquistas, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

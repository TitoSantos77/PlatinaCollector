import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../models/User.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";

export const data = new SlashCommandBuilder()
  .setName("estatisticas")
  .setDescription("Mostra estatísticas gerais do servidor (XP total, jogos mais feitos, etc)");

export async function execute(interaction) {

  // Buscar dados do Mongo
  const users = await User.find().lean();
  const stats = await UserStats.find().lean();
  const globalStats = await GlobalStats.findOne().lean();

  // Total de jogadores
  const totalJogadores = users.length;

  // Total de XP do servidor
  const totalXP = users.reduce((acc, u) => acc + (u.totalXP || 0), 0);

  // Total de platinas
  const totalPlatinas = stats.reduce((acc, u) => acc + (u.platinas || 0), 0);

  // Total de conquistas
  const totalConquistas = stats.reduce((acc, u) => acc + (u.conquistas || 0), 0);

  // Jogo mais platinado
  let jogoMaisFeito = "Nenhum";
  if (globalStats?.jogos && globalStats.jogos.size > 0) {
    jogoMaisFeito = [...globalStats.jogos.entries()]
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // Plataforma mais usada
  let plataformaMaisUsada = "Nenhuma";
  if (globalStats?.plataformas && globalStats.plataformas.size > 0) {
    plataformaMaisUsada = [...globalStats.plataformas.entries()]
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // User com mais XP
  let topXP = "Nenhum";
  if (users.length > 0) {
    const sortedXP = [...users].sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));
    topXP = `<@${sortedXP[0].userId}> (${sortedXP[0].totalXP} XP)`;
  }

  // User com mais platinas
  let topPlatinas = "Nenhum";
  if (stats.length > 0) {
    const sortedPlatinas = [...stats].sort((a, b) => (b.platinas || 0) - (a.platinas || 0));
    topPlatinas = `<@${sortedPlatinas[0].userId}> (${sortedPlatinas[0].platinas} platinas)`;
  }

  // User com mais conquistas
  let topConquistas = "Nenhum";
  if (stats.length > 0) {
    const sortedConquistas = [...stats].sort((a, b) => (b.conquistas || 0) - (a.conquistas || 0));
    topConquistas = `<@${sortedConquistas[0].userId}> (${sortedConquistas[0].conquistas} conquistas)`;
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

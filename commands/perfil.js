import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserGames from "../models/UserGames.js";
import { getUserStats } from "../utils/userStats.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("perfil")
  .setDescription("Mostra o teu perfil de jogador");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar stats do user no Mongo
  let stats = await UserStats.findOne({ userId });

  // Criar se não existir
  if (!stats) {
    stats = await UserStats.create({
      userId,
      xp: 0,
      totalXP: 0,
      nivel: 1,
      totalPlatinas: 0,
      totalCarreira: 0
    });
  }

  // ============================
  // REBUILD AUTOMÁTICO SE ESTIVER VAZIO
  // ============================
  const statsAtualizados = await getUserStats(userId);

  const statsVazio =
    (!statsAtualizados.totalPlatinas || statsAtualizados.totalPlatinas === 0) &&
    (!statsAtualizados.totalCarreira || statsAtualizados.totalCarreira === 0) &&
    (!statsAtualizados.ultimaPlatina || !statsAtualizados.ultimaPlatina.jogo) &&
    (!statsAtualizados.ultimaCarreira || !statsAtualizados.ultimaCarreira.categoria);

  if (statsVazio) {
    const userGames = await UserGames.findOne({ userId });

    if (userGames) {
      const totalPlatinas = userGames.platinas?.length || 0;
      const totalCarreira = userGames.carreira?.length || 0;

      const ultimaPlatina =
        totalPlatinas > 0
          ? userGames.platinas[userGames.platinas.length - 1]
          : null;

      const ultimaCarreira =
        totalCarreira > 0
          ? userGames.carreira[userGames.carreira.length - 1]
          : null;

      await UserStats.findOneAndUpdate(
        { userId },
        {
          totalPlatinas,
          totalCarreira,
          ultimaPlatina,
          ultimaCarreira
        },
        { new: true }
      );

      statsAtualizados.totalPlatinas = totalPlatinas;
      statsAtualizados.totalCarreira = totalCarreira;
      statsAtualizados.ultimaPlatina = ultimaPlatina;
      statsAtualizados.ultimaCarreira = ultimaCarreira;
    }
  }

  stats = statsAtualizados;

  // ============================
  // ESTATÍSTICAS DO USER
  // ============================
  const platinas = stats.totalPlatinas ?? 0;
  const carreira = stats.totalCarreira ?? 0;

  const ultimaPlatinaTexto = stats.ultimaPlatina?.jogo
    ? `${stats.ultimaPlatina.jogo}${stats.ultimaPlatina.plataforma ? ` (${stats.ultimaPlatina.plataforma})` : ""}`
    : "Nenhuma ainda";

  const ultimaCarreiraTexto = stats.ultimaCarreira?.categoria
    ? `${stats.ultimaCarreira.categoria} / ${stats.ultimaCarreira.subcategoria} (${stats.ultimaCarreira.plataforma})`
    : "Nenhuma ainda";

  // ============================
  // XP E NÍVEL
  // ============================
  const nivel = stats.nivel;
  const xpAtual = stats.xp;
  const xpProximo = xpNecessario(nivel);

  const percent = Math.min(100, Math.floor((xpAtual / xpProximo) * 100));

  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  // ============================
  // EMBED FINAL
  // ============================
  const embed = new EmbedBuilder()
    .setColor("#0055FF")
    .setTitle("🎮 Perfil do Jogador")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "👤 Jogador", value: interaction.user.username, inline: true },
      { name: "🏅 Nível", value: `${nivel}`, inline: true },

      { name: "✨ XP Total", value: `${stats.totalXP} XP`, inline: true },
      { name: "✨ XP Atual", value: `${xpAtual} XP`, inline: true },
      { name: "🎯 XP Necessário", value: `${xpProximo} XP`, inline: true },

      { name: "📊 Progresso", value: `${percent}%`, inline: true },
      { name: "🔵 Barra de XP", value: `\`${barra}\``, inline: false },

      { name: "🏆 Platinas", value: `${platinas}`, inline: true },
      { name: "🚗 Carreira GTA", value: `${carreira}`, inline: true },

      { name: "Última Platina", value: ultimaPlatinaTexto, inline: false },
      { name: "Última Ação de Carreira", value: ultimaCarreiraTexto, inline: false }
    )
    .setFooter({ text: "Continua a evoluir, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

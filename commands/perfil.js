import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { readJSON } from "../utils/database.js";
import { getUserStats } from "../utils/userStats.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("perfil")
  .setDescription("Mostra o teu perfil de jogador");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar stats do user no Mongo
  let user = await UserStats.findOne({ userId });

  // Criar se não existir
  if (!user) {
    user = await UserStats.create({
      userId,
      xp: 0,
      totalXP: 0,
      nivel: 1,
      platinas: 0,
      proezas: 0,
      badgesDesbloqueadas: []
    });
  }

  const badgesDB = readJSON("data/badges.json") || [];

  // ============================
  // 🔵 BADGE PRINCIPAL
  // ============================
  let badgePrincipal = "Nenhuma";

  if (Array.isArray(user.badgesDesbloqueadas) && user.badgesDesbloqueadas.length > 0) {

    const raridadeOrdem = ["Comum", "Incomum", "Rara", "Épica", "Lendária", "Mítica", "Exótica"];

    const desbloqueadasInfo = user.badgesDesbloqueadas
      .map(id => badgesDB.find(b => b.id === id))
      .filter(b => b && b.nome && b.emoji && b.raridade);

    if (desbloqueadasInfo.length > 0) {
      desbloqueadasInfo.sort(
        (a, b) => raridadeOrdem.indexOf(b.raridade) - raridadeOrdem.indexOf(a.raridade)
      );

      const top = desbloqueadasInfo[0];
      badgePrincipal = `${top.emoji} ${top.nome}`;
    }
  }

  // ============================
  // 🔵 ESTATÍSTICAS DO USER
  // ============================
  const stats = await getUserStats(userId);

  const platinas = stats.platinas ?? 0;
  const proezas = stats.proezas ?? 0;

  const ultimaPlatinaTexto = stats.ultimaPlatina?.jogo
    ? `${stats.ultimaPlatina.jogo}${stats.ultimaPlatina.plataforma ? ` (${stats.ultimaPlatina.plataforma})` : ""}`
    : "Nenhuma ainda";

  const ultimaProezaTexto = stats.ultimaProeza?.jogo
    ? `${stats.ultimaProeza.jogo}${stats.ultimaProeza.plataforma ? ` (${stats.ultimaProeza.plataforma})` : ""}`
    : "Nenhuma ainda";

  // ============================
  // 🔵 XP E NÍVEL
  // ============================
  const nivel = user.nivel;
  const xpAtual = user.xp;
  const xpProximo = xpNecessario(nivel);

  const percent = Math.min(100, Math.floor((xpAtual / xpProximo) * 100));

  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  // ============================
  // 🔵 EMBED FINAL
  // ============================
  const embed = new EmbedBuilder()
    .setColor("#0055FF")
    .setTitle("🎮 Perfil do Jogador")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "👤 Jogador", value: interaction.user.username, inline: true },
      { name: "🏅 Nível", value: `${nivel}`, inline: true },
      { name: "🔰 Badge Principal", value: badgePrincipal, inline: true },

      { name: "✨ XP Total", value: `${user.totalXP} XP`, inline: true },
      { name: "✨ XP Atual", value: `${xpAtual} XP`, inline: true },
      { name: "🎯 XP Necessário", value: `${xpProximo} XP`, inline: true },

      { name: "📊 Progresso", value: `${percent}%`, inline: true },
      { name: "🔵 Barra de XP", value: `\`${barra}\``, inline: false },

      { name: "🏆 Platinas", value: `${platinas}`, inline: true },
      { name: "🥇 Proezas", value: `${proezas}`, inline: true },

      { name: "Última Platina", value: ultimaPlatinaTexto, inline: false },
      { name: "Última Proeza", value: ultimaProezaTexto, inline: false }
    )
    .setFooter({ text: "Continua a evoluir, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

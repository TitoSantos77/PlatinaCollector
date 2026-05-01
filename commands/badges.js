import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON, writeJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("badges")
  .setDescription("Mostra todas as badges que já desbloqueaste");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Ler ficheiros
  const users = readJSON("data/users.json") || {};
  const rawBadges = readJSON("data/badges.json") || [];

  // Garantir que badgesDB é um array
  const badgesDB = Array.isArray(rawBadges)
    ? rawBadges
    : Object.values(rawBadges);

  // Garantir que o user existe
  if (!users[userId]) {
    users[userId] = {
      xp: 0,
      nivel: 1,
      totalXP: 0,
      platinas: 0,
      conquistas: 0,
      badge: "⚪ Iniciante",
      badgesDesbloqueadas: []
    };
    writeJSON("data/users.json", users);
  }

  const user = users[userId];
  const desbloqueadas = user.badgesDesbloqueadas || [];

  // Ordenar por raridade
  const raridadeOrdem = ["Comum", "Incomum", "Rara", "Épica", "Lendária", "Mítica", "Exótica"];

  const todasOrdenadas = badgesDB.sort((a, b) =>
    raridadeOrdem.indexOf(a.raridade) - raridadeOrdem.indexOf(b.raridade)
  );

  // Barra de progresso
  const total = todasOrdenadas.length;
  const qtdDesbloqueadas = desbloqueadas.length;
  const percent = total > 0 ? Math.floor((qtdDesbloqueadas / total) * 100) : 0;

  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  // Lista de badges
  const lista = todasOrdenadas.map(badge => {
    const unlocked = desbloqueadas.includes(badge.id);

    if (badge.secreta && !unlocked) {
      return `🔒 **Badge Secreta** — ???`;
    }

    return unlocked
      ? `✔️ **${badge.emoji} ${badge.nome}** — *${badge.raridade}*\n> ${badge.descricao}`
      : `🔒 ${badge.emoji} **${badge.nome}** — *${badge.raridade}*`;
  });

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle(`🏅 Badges de ${interaction.user.username}`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "📊 Progresso", value: `${qtdDesbloqueadas} / ${total} (${percent}%)`, inline: true },
      { name: "🔵 Barra de Progresso", value: `\`${barra}\`` },
      { name: "📜 Badges", value: lista.join("\n\n") }
    )
    .setFooter({ text: "Continua a colecionar badges, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

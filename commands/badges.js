import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("badges")
  .setDescription("Mostra todas as badges que já desbloqueaste");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Ler badges do ficheiro
  const rawBadges = readJSON("data/badges.json") || [];

  const badgesDB = Array.isArray(rawBadges)
    ? rawBadges
    : Object.values(rawBadges);

  // Buscar user do Mongo
  let user = await UserStats.findOne({ userId });

  if (!user) {
    return interaction.reply({
      content: "❌ Ainda não tens perfil criado. Usa /perfil primeiro!",
      ephemeral: true
    });
  }

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

    // Badge secreta bloqueada
    if (badge.secreta && !unlocked) {
      return `🔒 **Badge Secreta** — ???`;
    }

    // Badge normal desbloqueada
    if (unlocked) {
      return `✔️ **${badge.emoji} ${badge.nome}** — *${badge.raridade}*\n> ${badge.descricao}`;
    }

    // Badge normal bloqueada
    return `🔒 ${badge.emoji} **${badge.nome}** — *${badge.raridade}*`;
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
    .setFooter({ text: "✔️ = desbloqueada | 🔒 = bloqueada" });

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("badges")
  .setDescription("Mostra todas as badges que já desbloqueaste");

export async function execute(interaction) {
  const userId = interaction.user.id;

  const rawBadges = readJSON("data/badges.json") || [];
  const badgesDB = Array.isArray(rawBadges)
    ? rawBadges
    : Object.values(rawBadges);

  let user = await UserStats.findOne({ userId });

  if (!user) {
    return interaction.reply({
      content: "❌ Ainda não tens perfil criado. Usa /perfil primeiro!",
      flags: 64
    });
  }

  const desbloqueadas = Array.isArray(user.badgesDesbloqueadas)
    ? user.badgesDesbloqueadas
    : [];

  const raridadeOrdem = ["Comum", "Incomum", "Rara", "Épica", "Lendária", "Mítica", "Exótica"];

  const todasOrdenadas = badgesDB.sort((a, b) =>
    raridadeOrdem.indexOf(a.raridade || "Comum") -
    raridadeOrdem.indexOf(b.raridade || "Comum")
  );

  const total = todasOrdenadas.length;
  const qtdDesbloqueadas = desbloqueadas.length;
  const percent = total > 0 ? Math.floor((qtdDesbloqueadas / total) * 100) : 0;

  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  const lista = todasOrdenadas.map(badge => {
    const id = badge.id || null;
    const emoji = badge.emoji || "🔸";
    const nome = badge.nome || "Badge Sem Nome";
    const raridade = badge.raridade || "Comum";
    const descricao = badge.descricao || "Descrição curta indisponível.";
    const secreta = badge.secreta || false;

    const unlocked = id && desbloqueadas.includes(id);

    if (secreta && !unlocked) {
      return `🔒 **Badge Secreta** — ???`;
    }

    if (unlocked) {
      return `✨ **${emoji} ${nome}** — *${raridade}*\n> ${descricao}`;
    }

    return `🔒 ${emoji} **${nome}** — *${raridade}*`;
  });

  const fields = [];
  let buffer = "";

  for (const line of lista) {
    if ((buffer + "\n\n" + line).length > 1024) {
      fields.push({ name: "📜 Badges", value: buffer });
      buffer = line;
    } else {
      buffer += (buffer ? "\n\n" : "") + line;
    }
  }

  if (buffer.length > 0) {
    fields.push({ name: "📜 Badges", value: buffer });
  }

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle(`🏅 Badges de ${interaction.user.username}`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "📊 Progresso", value: `${qtdDesbloqueadas} / ${total} (${percent}%)`, inline: true },
      { name: "🔵 Barra de Progresso", value: `\`${barra}\`` },
      ...fields
    )
    .setFooter({ text: "✨ = desbloqueada | 🔒 = bloqueada" });

  await interaction.reply({ embeds: [embed] });
}

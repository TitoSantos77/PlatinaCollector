import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("badges")
  .setDescription("Mostra todas as badges que já desbloqueaste");

export async function execute(interaction) {
  const userId = interaction.user.id;

  const users = readJSON("data/users.json");
  const user = users[userId] || {};

  const badgeAtual = user.badge || "⚪ Iniciante";
  const badgesDesbloqueadas = user.badgesDesbloqueadas || ["⚪ Iniciante"];

  // ✔ LISTA OFICIAL DAS TUAS BADGES
  const todasAsBadges = [
    "⚪ Iniciante",
    "🟫 Bronze Hunter",
    "🟧 Elite Hunter",
    "🟪 Master Hunter",
    "🟨 Legendary Hunter"
  ];

  // Barra de progresso (20 blocos)
  const total = todasAsBadges.length;
  const desbloqueadas = badgesDesbloqueadas.length;
  const percent = Math.floor((desbloqueadas / total) * 100);

  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  // Formatar lista (verde = desbloqueada, cinza = bloqueada)
  const listaFormatada = todasAsBadges.map(badge => {
    const desbloqueada = badgesDesbloqueadas.includes(badge);

    return desbloqueada
      ? `🟩 **${badge}**`
      : `⬜ ${badge}`;
  });

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏅 Sistema de Badges")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "🏆 Badge Atual", value: `**${badgeAtual}**`, inline: true },
      { name: "📊 Progresso", value: `${desbloqueadas} / ${total} (${percent}%)`, inline: true },
      { name: "🔵 Barra de Progresso", value: `\`${barra}\`` },
      { name: "📜 Todas as Badges", value: listaFormatada.join("\n") }
    )
    .setFooter({ text: "Continua a colecionar badges, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

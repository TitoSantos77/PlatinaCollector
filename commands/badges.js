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

  // ✔ LISTA OFICIAL DAS TUAS BADGES (NÃO INVENTEI NENHUMA)
  const todasAsBadges = [
    "⚪ Iniciante",
    "🟫 Bronze Hunter",
    "🟧 Elite Hunter",
    "🟪 Master Hunter",
    "🟨 Legendary Hunter"
  ];

  // Formatar lista (verde = desbloqueada, branco = bloqueada)
  const listaFormatada = todasAsBadges.map(badge => {
    return badgesDesbloqueadas.includes(badge)
      ? `🟩 ${badge}`   // desbloqueada
      : `⬜ ${badge}`;  // bloqueada
  });

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏅 Badges Desbloqueadas")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "Badge Atual", value: badgeAtual },
      { name: "Progresso", value: `${badgesDesbloqueadas.length} / ${todasAsBadges.length}` },
      { name: "Todas as Badges", value: listaFormatada.join("\n") }
    )
    .setFooter({ text: "Continua a colecionar badges!" });

  await interaction.reply({ embeds: [embed] });
}

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
  const badges = user.badgesDesbloqueadas || ["⚪ Iniciante"];

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("🏅 Badges Desbloqueadas")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "Badge Atual", value: badgeAtual },
      { name: "Todas as Badges", value: badges.join("\n") }
    )
    .setFooter({ text: "Continua a colecionar badges!" });

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import { verificarBadges } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("fixbadges")
  .setDescription("Recalcula TODAS as badges retroativamente para TODOS os utilizadores.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.reply("🔧 A recalcular badges retroativas...");

  const users = await UserStats.find();
  let corrigidos = 0;

  for (const user of users) {
    // limpar badges antigas
    user.badgesDesbloqueadas = [];
    await user.save();

    // reconstruir badges retroativas
    await verificarBadges(user.userId);

    corrigidos++;
  }

  return interaction.followUp(
    `🏅 Badges reconstruídas com sucesso!\n` +
    `👥 Utilizadores atualizados: **${corrigidos}**`
  );
}

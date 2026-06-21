import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import { getBadgeByLevel } from "../utils/xpSystem.js";

export const data = new SlashCommandBuilder()
  .setName("fixbadges")
  .setDescription("Recalcula e corrige badges de todos os utilizadores (ADMIN).")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.reply("🔧 A recalcular badges...");

  const statsUsers = await UserStats.find();
  let corrigidos = 0;

  for (const stats of statsUsers) {
    const badgeCorreta = getBadgeByLevel(stats.nivel);

    // Criar array se não existir
    if (!Array.isArray(stats.badgesDesbloqueadas)) {
      stats.badgesDesbloqueadas = [];
    }

    // Atualizar badge principal
    stats.badge = badgeCorreta;

    // Garantir que está desbloqueada
    if (!stats.badgesDesbloqueadas.includes(badgeCorreta)) {
      stats.badgesDesbloqueadas.push(badgeCorreta);
    }

    await stats.save();
    corrigidos++;
  }

  return interaction.followUp(
    `🏅 Badges corrigidas com sucesso!\n` +
    `👥 Utilizadores atualizados: **${corrigidos}**`
  );
}

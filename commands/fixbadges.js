import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import { verificarBadges } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("fixbadges")
  .setDescription("Corrige o sistema de badges do utilizador")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Verificar se é admin
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  let user = await UserStats.findOne({ userId });

  if (!user) {
    return interaction.reply({
      content: "❌ Não tens perfil criado. Usa /perfil primeiro!",
      ephemeral: true
    });
  }

  // 0) LIMPAR TODAS AS BADGES ANTES DE REVERIFICAR
  user.badgesDesbloqueadas = [];

  // 1) Remover campo antigo "badge"
  if (user.badge) {
    delete user.badge;
  }

  // 2) Garantir que badgesDesbloqueadas existe e é array
  if (!Array.isArray(user.badgesDesbloqueadas)) {
    user.badgesDesbloqueadas = [];
  }

  // 3) Limpar badges inválidas (emojis, nomes antigos, etc.)
  user.badgesDesbloqueadas = user.badgesDesbloqueadas.filter(id =>
    typeof id === "string" && id.includes("_")
  );

  await user.save();

  // 4) Recalcular badges automaticamente (agora com requisitos)
  await verificarBadges(userId);

  return interaction.reply({
    content: "🔧 Badges recalculadas com sucesso! Corre /badges para confirmar.",
    ephemeral: true
  });
}

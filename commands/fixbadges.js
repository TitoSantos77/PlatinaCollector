import { SlashCommandBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { verificarBadges } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("fixbadges")
  .setDescription("Corrige o sistema de badges do utilizador");

export async function execute(interaction) {
  const userId = interaction.user.id;

  let user = await UserStats.findOne({ userId });

  if (!user) {
    return interaction.reply({
      content: "❌ Não tens perfil criado. Usa /perfil primeiro!",
      ephemeral: true
    });
  }

  // 1) Remover campo antigo "badge"
  if (user.badge) {
    delete user.badge;
  }

  // 2) Garantir que badgesDesbloqueadas existe e é um array
  if (!Array.isArray(user.badgesDesbloqueadas)) {
    user.badgesDesbloqueadas = [];
  }

  // 3) Limpar badges inválidas (emojis, nomes antigos, etc.)
  user.badgesDesbloqueadas = user.badgesDesbloqueadas.filter(id =>
    typeof id === "string" && id.includes("_")
  );

  await user.save();

  // 4) Recalcular badges automaticamente
  await verificarBadges(userId);

  return interaction.reply({
    content: "✅ Sistema de badges corrigido com sucesso! Corre /badges outra vez.",
    ephemeral: true
  });
}

import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("carreira_reset_stats")
  .setDescription("Limpa todos os dados da carreira GTA no UserStats (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt =>
    opt.setName("user").setDescription("Utilizador alvo").setRequired(true)
  );

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const user = interaction.options.getUser("user");
  const userId = user.id;

  const stats = await UserStats.findOne({ userId });

  if (!stats) {
    return interaction.reply({
      content: "❌ Este utilizador não tem UserStats.",
      ephemeral: true
    });
  }

  // LIMPAR CAMPOS DA CARREIRA
  stats.totalCarreira = 0;
  stats.ultimaCarreira = null;

  await stats.save();

  return interaction.reply({
    content: `🗑 Todos os dados da carreira GTA foram limpos do UserStats de **${user.username}**.`,
    ephemeral: false
  });
}

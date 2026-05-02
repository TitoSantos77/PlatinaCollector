import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import UserStats from "../models/UserStats.js";
import { xpNecessario } from "../utils/xp.js";
import { atualizarBadge } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("darxp")
  .setDescription("Dar XP manualmente a um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt =>
    opt
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt
      .setName("quantidade")
      .setDescription("Quantidade de XP a dar")
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const user = interaction.options.getUser("user");
  const quantidade = interaction.options.getInteger("quantidade");

  if (quantidade <= 0) {
    return interaction.reply({
      content: "❌ A quantidade de XP deve ser maior que zero.",
      ephemeral: true
    });
  }

  let stats = await UserStats.findOne({ userId: user.id });

  if (!stats) {
    return interaction.reply({
      content: "❌ Este utilizador ainda não tem perfil criado.",
      ephemeral: true
    });
  }

  // XP antes
  const xpAntes = stats.totalXP;
  const nivelAntes = stats.nivel;

  // Adicionar XP
  stats.totalXP += quantidade;

  // Recalcular nível
  let nivel = 1;
  let xpTemp = stats.totalXP;

  while (xpTemp >= xpNecessario(nivel)) {
    xpTemp -= xpNecessario(nivel);
    nivel++;
  }

  stats.nivel = nivel;
  stats.xp = xpTemp;

  // Atualizar badge
  atualizarBadge(stats);

  await stats.save();

  const embed = new EmbedBuilder()
    .setColor("#00FF88")
    .setTitle("✨ XP Adicionado!")
    .setDescription(`XP adicionado ao utilizador **${user.username}**`)
    .addFields(
      { name: "📥 XP Adicionado", value: `+${quantidade} XP`, inline: true },
      { name: "📊 XP Total Antes", value: `${xpAntes}`, inline: true },
      { name: "📈 XP Total Agora", value: `${stats.totalXP}`, inline: true },
      { name: "🏅 Nível Antes", value: `${nivelAntes}`, inline: true },
      { name: "🚀 Nível Agora", value: `${stats.nivel}`, inline: true },
      { name: "🔰 Badge Atual", value: stats.badge, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import { xpNecessario } from "../utils/xp.js";
import { verificarBadges } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("remover")
  .setDescription("Remove platinas ou proezas de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres remover?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Proeza", value: "proeza" }
      )
  )

  .addUserOption(opt =>
    opt
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  );

// ===============================
// EXECUTAR /REMOVER
// ===============================
export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");
  const userId = user.id;

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  if (!games || !stats) {
    return interaction.reply({
      content: "❌ Este utilizador não tem registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.proezas;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 O utilizador não tem nenhuma ${tipo}.`,
      ephemeral: true
    });
  }

  // Criar menu com todas as entradas
  const options = lista.map((item, index) => ({
    label: `${index + 1} — ${item.jogo} (${item.plataforma})`,
    value: `${userId}_${tipo}_${index}`
  }));

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("remover_escolher_item")
      .setPlaceholder("Escolhe a entrada que queres remover")
      .addOptions(options)
  );

  await interaction.reply({
    content: `🗑 Escolhe a ${tipo} que queres remover de **${user.username}**:`,
    components: [row],
    ephemeral: false
  });
}

// ===============================
// SELECT MENU — REMOVER ITEM
// ===============================
export async function handleSelect(interaction) {
  if (interaction.customId !== "remover_escolher_item") return;

  const [userId, tipo, index] = interaction.values[0].split("_");
  const idx = parseInt(index);

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  const lista = tipo === "platina" ? games.platinas : games.proezas;
  const item = lista[idx];

  if (!item) {
    return interaction.update({
      content: "❌ Entrada inválida.",
      components: []
    });
  }

  // Remover entrada
  lista.splice(idx, 1);

  // Recalcular XP
  const xpPerdido = item.xpGanhos || 0;
  stats.totalXP = Math.max(0, stats.totalXP - xpPerdido);

  let nivel = 1;
  let xpTemp = stats.totalXP;

  while (xpTemp >= xpNecessario(nivel)) {
    xpTemp -= xpNecessario(nivel);
    nivel++;
  }

  stats.nivel = nivel;
  stats.xp = xpTemp;

  await verificarBadges(userId);

  if (tipo === "platina") {
    stats.ultimaPlatina = lista[lista.length - 1] || null;
  } else {
    stats.ultimaProeza = lista[lista.length - 1] || null;
  }

  await stats.save();
  await games.save();

  const embed = new EmbedBuilder()
    .setColor("#FF4444")
    .setTitle(tipo === "platina" ? "🗑 Platina removida" : "🗑 Proeza removida")
    .setDescription(`A entrada **${item.jogo} (${item.plataforma})** foi removida.`)
    .addFields(
      { name: "❌ XP Perdido", value: `${xpPerdido} XP`, inline: true },
      { name: "🏅 Novo Nível", value: `${stats.nivel}`, inline: true }
    )
    .setTimestamp();

  await interaction.update({
    content: "",
    embeds: [embed],
    components: []
  });
}

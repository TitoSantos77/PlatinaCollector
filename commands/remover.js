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
  .setDescription("Remove platinas ou entradas da carreira GTA de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres remover?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Carreira GTA", value: "carreira" }
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
      flags: ["Ephemeral"]
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
      flags: ["Ephemeral"]
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content:
        tipo === "platina"
          ? `📭 O utilizador não tem nenhuma platina.`
          : `📭 O utilizador não tem nenhuma entrada de carreira GTA.`,
      flags: ["Ephemeral"]
    });
  }

  // Criar menu com todas as entradas
  const options = lista.map((item, index) => ({
    label:
      tipo === "platina"
        ? `${index + 1} — ${item.jogo} (${item.plataforma})`
        : `${index + 1} — ${item.categoria} / ${item.subcategoria} (${item.plataforma})`,
    value: `${userId}_${tipo}_${index}`
  }));

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("remover_escolher_item")
      .setPlaceholder("Escolhe a entrada que queres remover")
      .addOptions(options)
  );

  await interaction.reply({
    content: `🗑 Escolhe a entrada de **${tipo}** que queres remover de **${user.username}**:`,
    components: [row]
  });
}

// ===============================
// SELECT MENU — REMOVER ITEM
// ===============================
export async function handleSelect(interaction) {
  if (interaction.customId !== "remover_escolher_item") return;

  // Segurança extra
  if (!interaction.values || interaction.values.length === 0) {
    return interaction.editReply({
      content: "❌ Erro: o menu não devolveu nenhum valor.",
      components: []
    });
  }

  const raw = interaction.values[0];
  const partes = raw.split("_");

  if (partes.length < 3) {
    return interaction.editReply({
      content: "❌ Erro: valor inválido recebido.",
      components: []
    });
  }

  const [userId, tipo, index] = partes;
  const idx = parseInt(index);

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  const lista = tipo === "platina" ? games.platinas : games.carreira;
  const item = lista[idx];

  if (!item) {
    return interaction.editReply({
      content: "❌ Entrada inválida.",
      components: []
    });
  }

  // Remover entrada
  lista.splice(idx, 1);

  // ===============================
  // RECONTAR XP TOTAL
  // ===============================
  let novoTotalXP = 0;

  novoTotalXP += (games.platinas?.length || 0) * 100; // XP por platina
  novoTotalXP += (games.carreira?.length || 0) * 50;  // XP por carreira

  let nivel = 1;
  let xpTemp = novoTotalXP;

  while (xpTemp >= xpNecessario(nivel)) {
    xpTemp -= xpNecessario(nivel);
    nivel++;
  }

  stats.totalXP = novoTotalXP;
  stats.nivel = nivel;
  stats.xp = xpTemp;

  // Atualizar última entrada
  if (tipo === "platina") {
    stats.ultimaPlatina = lista[lista.length - 1] || null;
  } else {
    stats.ultimaCarreira = lista[lista.length - 1] || null;
  }

  await verificarBadges(userId);

  await stats.save();
  await games.save();

  const texto =
    tipo === "platina"
      ? `${item.jogo} (${item.plataforma})`
      : `${item.categoria} / ${item.subcategoria} (${item.plataforma})`;

  const embed = new EmbedBuilder()
    .setColor("#FF4444")
    .setTitle(tipo === "platina" ? "🗑 Platina removida" : "🗑 Carreira GTA removida")
    .setDescription(`A entrada **${texto}** foi removida.`)
    .addFields(
      { name: "🏅 Novo Nível", value: `${stats.nivel}`, inline: true },
      { name: "✨ XP Atual", value: `${stats.xp} XP`, inline: true },
      { name: "📊 XP Total", value: `${stats.totalXP} XP`, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({
    content: "",
    embeds: [embed],
    components: []
  });
}

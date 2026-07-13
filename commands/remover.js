import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";
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
      content: "❌ Este utilizizador não tem registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content:
        tipo === "platina"
          ? `📭 O utilizador não tem nenhuma platina.`
          : `📭 O utilizador não tem nenhuma entrada de carreira GTA.`,
      ephemeral: true
    });
  }

  const options = lista.map((item, index) => ({
    label:
      tipo === "platina"
        ? `${index + 1} — ${item.jogo || "Sem nome"} (${item.plataforma || "??"})`
        : `${index + 1} — ${item.categoria || "Sem categoria"} / ${item.subcategoria || "Sem subcategoria"} (${item.plataforma || "??"})`,
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

  // 🔵 SEMPRE necessário para evitar InteractionNotReplied
  await interaction.deferUpdate().catch(() => {});

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
      content: "❌ Entrada inválida ou corrompida.",
      components: []
    });
  }

  // ===============================
  // REMOVER DO MONGO
  // ===============================
  if (tipo === "platina") {
    games.platinas.splice(idx, 1);
  } else {
    games.carreira.splice(idx, 1);
  }

  await games.save();

  // ===============================
  // RECONTAR XP
  // ===============================
  let novoTotalXP = 0;

  for (const p of games.platinas) novoTotalXP += p.xpGanhos || 100;
  for (const c of games.carreira) novoTotalXP += c.xpGanhos || 75;

  let nivel = 1;
  let xpTemp = novoTotalXP;

  while (xpTemp >= xpNecessario(nivel)) {
    xpTemp -= xpNecessario(nivel);
    nivel++;
  }

  stats.totalXP = novoTotalXP;
  stats.nivel = nivel;
  stats.xp = xpTemp;

  stats.ultimaPlatina = games.platinas.at(-1) || null;
  stats.ultimaCarreira = games.carreira.at(-1) || null;

  await verificarBadges(userId);
  await stats.save();

  // ===============================
  // ATUALIZAR ESTATÍSTICAS GLOBAIS
  // ===============================
  const globais = await GlobalStats.findOne() || new GlobalStats();

  globais.jogos = new Map();
  globais.plataformas = new Map();

  for (const p of games.platinas) {
    globais.jogos.set(p.jogo, (globais.jogos.get(p.jogo) || 0) + 1);
    globais.plataformas.set(p.plataforma, (globais.plataformas.get(p.plataforma) || 0) + 1);
  }

  globais.categoriasCarreira = [...new Set(games.carreira.map(c => c.categoria))];
  globais.subcategoriasCarreira = [...new Set(games.carreira.map(c => c.subcategoria))];
  globais.plataformasCarreira = [...new Set(games.carreira.map(c => c.plataforma))];

  await globais.save();

  // ===============================
  // EMBED FINAL
  // ===============================
  const texto =
    tipo === "platina"
      ? `${item.jogo || "Jogo desconhecido"} (${item.plataforma || "??"})`
      : `${item.categoria || "Categoria desconhecida"} / ${item.subcategoria || "Subcategoria desconhecida"} (${item.plataforma || "??"})`;

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

  try {
    const msg = await interaction.fetchReply();
    await msg.react("🗑️");
  } catch (err) {
    console.log("Falha ao reagir:", err);
  }
}

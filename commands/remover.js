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
      flags: ["Ephemeral"]
    });
  }

  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");
  const userId = user.id;

  console.log("=== /REMOVER EXECUTE DEBUG ===");
  console.log("TIPO:", tipo);
  console.log("USER:", userId);

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  console.log("UserGames encontrado:", JSON.stringify(games, null, 2));
  console.log("UserStats encontrado:", JSON.stringify(stats, null, 2));

  if (!games || !stats) {
    return interaction.reply({
      content: "❌ Este utilizador não tem registos.",
      flags: ["Ephemeral"]
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  console.log("LISTA SELECIONADA:", lista);

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content:
        tipo === "platina"
          ? `📭 O utilizador não tem nenhuma platina.`
          : `📭 O utilizador não tem nenhuma entrada de carreira GTA.`,
      flags: ["Ephemeral"]
    });
  }

  const options = lista.map((item, index) => ({
    label:
      tipo === "platina"
        ? `${index + 1} — ${item.jogo || "Sem nome"} (${item.plataforma || "??"})`
        : `${index + 1} — ${item.categoria || "Sem categoria"} / ${item.subcategoria || "Sem subcategoria"} (${item.plataforma || "??"})`,
    value: `${userId}_${tipo}_${index}`
  }));

  console.log("OPÇÕES DO MENU:", options);

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
  console.log("=== /REMOVER HANDLESELECT DEBUG ===");
  console.log("interaction.customId:", interaction.customId);
  console.log("interaction.values:", interaction.values);

  if (interaction.customId !== "remover_escolher_item") {
    console.log("customId inválido:", interaction.customId);
    return;
  }

  if (!interaction.values || interaction.values.length === 0) {
    console.log("ERRO: interaction.values vazio");
    return interaction.editReply({
      content: "❌ Erro: o menu não devolveu nenhum valor.",
      components: []
    });
  }

  const raw = interaction.values[0];
  console.log("RAW VALUE:", raw);

  const partes = raw.split("_");
  console.log("PARTES:", partes);

  if (partes.length < 3) {
    console.log("ERRO: partes inválidas:", partes);
    return interaction.editReply({
      content: "❌ Erro: valor inválido recebido.",
      components: []
    });
  }

  const [userId, tipo, index] = partes;
  const idx = parseInt(index);

  console.log("USER:", userId);
  console.log("TIPO:", tipo);
  console.log("INDEX:", idx);

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  console.log("UserGames encontrado:", JSON.stringify(games, null, 2));

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  console.log("LISTA COMPLETA:", lista);
  console.log("LISTA LENGTH:", lista.length);

  const item = lista[idx];

  console.log("ITEM SELECIONADO:", item);

  if (!item) {
    console.log("ERRO: item undefined no índice", idx);
    return interaction.editReply({
      content: "❌ Entrada inválida ou corrompida.",
      components: []
    });
  }

  // ===============================
  // REMOVER DO MONGO
  // ===============================
  console.log("A REMOVER ITEM:", item);

  if (tipo === "platina") {
    games.platinas.splice(idx, 1);
  } else {
    games.carreira.splice(idx, 1);
  }

  console.log("NOVO ESTADO DE UserGames:", JSON.stringify(games, null, 2));

  await games.save();

  // ===============================
  // RECONTAR XP
  // ===============================
  let novoTotalXP = 0;

  for (const p of games.platinas) {
    novoTotalXP += p.xpGanhos || 100;
  }

  for (const c of games.carreira) {
    novoTotalXP += c.xpGanhos || 75;
  }

  let nivel = 1;
  let xpTemp = novoTotalXP;

  while (xpTemp >= xpNecessario(nivel)) {
    xpTemp -= xpNecessario(nivel);
    nivel++;
  }

  stats.totalXP = novoTotalXP;
  stats.nivel = nivel;
  stats.xp = xpTemp;

  stats.ultimaPlatina = games.platinas[games.platinas.length - 1] || null;
  stats.ultimaCarreira = games.carreira[games.carreira.length - 1] || null;

  await verificarBadges(userId);
  await stats.save();

  // ===============================
  // ATUALIZAR ESTATÍSTICAS GLOBAIS — CORRIGIDO
  // ===============================
  const globais = await GlobalStats.findOne() || new GlobalStats();

  // PLATINAS — MAPS
  globais.jogos = new Map();
  globais.plataformas = new Map();

  for (const p of games.platinas) {
    globais.jogos.set(p.jogo, (globais.jogos.get(p.jogo) || 0) + 1);
    globais.plataformas.set(p.plataforma, (globais.plataformas.get(p.plataforma) || 0) + 1);
  }

  // CARREIRA GTA — ARRAYS
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

  console.log("=== /REMOVER HANDLESELECT FIM ===");
}

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserGames from "../models/UserGames.js"; // platinas e conquistas
import { atualizarBadge } from "../utils/badges.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("remover")
  .setDescription("Remove platinas ou conquistas de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName("tipo")
      .setDescription("O que queres remover?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Conquista", value: "conquista" }
      )
  )
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName("numero")
      .setDescription("Número da platina/conquista a remover")
  )
  .addStringOption(option =>
    option
      .setName("numeros")
      .setDescription("Lista de números (ex: 2,4,7)")
  )
  .addBooleanOption(option =>
    option
      .setName("tudo")
      .setDescription("Remover TODAS as platinas/conquistas do utilizador")
  );

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");
  const numero = interaction.options.getInteger("numero");
  const numerosStr = interaction.options.getString("numeros");
  const tudo = interaction.options.getBoolean("tudo");

  const userId = user.id;

  // Buscar dados do user
  const stats = await UserStats.findOne({ userId });
  const games = await UserGames.findOne({ userId });

  if (!stats || !games) {
    return interaction.reply({
      content: "❌ Este utilizador ainda não tem registos.",
      ephemeral: true
    });
  }

  // Selecionar lista correta
  const lista = tipo === "platina" ? games.platinas : games.conquistas;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 O utilizador não tem nenhuma ${tipo}.`,
      ephemeral: true
    });
  }

  // Determinar IDs a remover
  let indices = [];

  if (tudo) {
    indices = lista.map((_, i) => i);
  } else if (numerosStr) {
    indices = numerosStr
      .split(",")
      .map(n => parseInt(n.trim()) - 1)
      .filter(i => i >= 0 && i < lista.length);
  } else if (numero) {
    const idx = numero - 1;
    if (idx >= 0 && idx < lista.length) indices = [idx];
  }

  if (indices.length === 0) {
    return interaction.reply({
      content: "❌ Nenhuma entrada válida para remover.",
      ephemeral: true
    });
  }

  // Ordenar desc para remover sem estragar índices
  indices.sort((a, b) => b - a);

  let removidos = [];
  let xpPerdido = 0;

  for (const idx of indices) {
    const item = lista[idx];
    removidos.push(item);

    xpPerdido += item.xpGanhos || 0;

    // Remover da lista
    lista.splice(idx, 1);
  }

  // Atualizar XP total
  stats.totalXP = Math.max(0, stats.totalXP - xpPerdido);

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

  // Atualizar última platina/conquista
  if (tipo === "platina") {
    stats.ultimaPlatina = lista[lista.length - 1] || null;
  } else {
    stats.ultimaConquista = lista[lista.length - 1] || null;
  }

  await stats.save();
  await games.save();

  // Embed detalhado
  const detalhes = removidos
    .map(r => `• **${r.jogo}** (${r.plataforma}) — ${r.data}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#FF4444")
    .setTitle(`🗑 ${tipo === "platina" ? "Platinas" : "Conquistas"} removidas`)
    .setDescription(`Foram removidas **${removidos.length}** entradas do utilizador **${user.username}**.`)
    .addFields(
      { name: "📋 Detalhes", value: detalhes },
      { name: "❌ XP Perdido", value: `${xpPerdido} XP`, inline: true },
      { name: "🏅 Novo Nível", value: `${stats.nivel}`, inline: true },
      { name: "🔰 Nova Badge", value: stats.badge, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

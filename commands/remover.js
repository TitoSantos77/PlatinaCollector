import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import { xpNecessario } from "../utils/xp.js";
import { atualizarBadge } from "../utils/badges.js";

export const data = new SlashCommandBuilder()
  .setName("remover")
  .setDescription("Remove platinas ou conquistas de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres remover?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Conquista", value: "conquista" }
      )
  )
  .addUserOption(opt =>
    opt
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addStringOption(opt =>
    opt
      .setName("numero")
      .setDescription("Número da entrada a remover")
      .setAutocomplete(true) // <-- ATUALIZADO
  )
  .addStringOption(opt =>
    opt
      .setName("numeros")
      .setDescription("Lista de números (ex: 2,4,7)")
  )
  .addBooleanOption(opt =>
    opt
      .setName("tudo")
      .setDescription("Remover TODAS as entradas do utilizador")
  );

// 🔥 AUTOCOMPLETE
export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);

  if (focused.name !== "numero") return;

  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");

  // Só funciona se já escolheram tipo e user
  if (!tipo || !user) return interaction.respond([]);

  const games = await UserGames.findOne({ userId: user.id });
  if (!games) return interaction.respond([]);

  const lista = tipo === "platina" ? games.platinas : games.conquistas;

  if (!lista || lista.length === 0) return interaction.respond([]);

  const opcoes = lista.map((item, index) => {
    const numero = index + 1;
    return {
      name: `${numero} — ${item.jogo} (${item.plataforma})`,
      value: String(numero)
    };
  });

  const filtrados = opcoes
    .filter(o => o.name.toLowerCase().includes(focused.value.toLowerCase()))
    .slice(0, 25);

  return interaction.respond(filtrados);
}

// 🔥 EXECUÇÃO DO COMANDO
export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem usar este comando.",
      ephemeral: true
    });
  }

  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");
  const numero = interaction.options.getString("numero"); // <-- agora é string
  const numerosStr = interaction.options.getString("numeros");
  const tudo = interaction.options.getBoolean("tudo");

  const userId = user.id;

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  if (!games || !stats) {
    return interaction.reply({
      content: "❌ Este utilizador não tem registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.conquistas;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 O utilizador não tem nenhuma ${tipo}.`,
      ephemeral: true
    });
  }

  // Determinar índices a remover
  let indices = [];

  if (tudo) {
    indices = lista.map((_, i) => i);
  } else if (numerosStr) {
    indices = numerosStr
      .split(",")
      .map(n => parseInt(n.trim()) - 1)
      .filter(i => i >= 0 && i < lista.length);
  } else if (numero) {
    const idx = parseInt(numero) - 1;
    if (idx >= 0 && idx < lista.length) indices = [idx];
  }

  if (indices.length === 0) {
    return interaction.reply({
      content: "❌ Nenhuma entrada válida para remover.",
      ephemeral: true
    });
  }

  // Ordenar desc para não estragar índices
  indices.sort((a, b) => b - a);

  let removidos = [];
  let xpPerdido = 0;

  for (const idx of indices) {
    const item = lista[idx];
    removidos.push(item);
    xpPerdido += item.xpGanhos || 0;
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

  // Criar embed detalhado
  const detalhes = removidos
    .map(r => `• **${r.jogo}** (${r.plataforma}) — ${r.data}`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#FF4444")
    .setTitle(
      tipo === "platina"
        ? "🗑 Platinas removidas"
        : "🗑 Conquistas removidas"
    )
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

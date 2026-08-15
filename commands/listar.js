import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import UserGames from "../models/UserGames.js";

export const data = new SlashCommandBuilder()
  .setName("listar")
  .setDescription("Lista platinas ou entradas da carreira GTA de um utilizador")
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres listar?")
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

const POR_PAGINA = 10;

function formatarTimestamp(timestamp) {
  if (!timestamp) return "sem data";

  const data = new Date(timestamp);
  if (Number.isNaN(data.getTime())) return "sem data";

  const partes = new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(data);

  const obter = tipo => partes.find(parte => parte.type === tipo)?.value;

  return `${obter("day")}-${obter("month")}-${obter("year")} ${obter("hour")}:${obter("minute")}`;
}

function gerarEmbed(lista, tipo, username, pagina) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaSegura = Math.min(Math.max(0, pagina), totalPaginas - 1);
  const inicio = paginaSegura * POR_PAGINA;
  const slice = lista.slice(inicio, inicio + POR_PAGINA);

  const texto = slice
    .map((item, i) => {
      const numero = inicio + i + 1;
      const dataItem = item.data || formatarTimestamp(item.timestamp);

      if (tipo === "platina") {
        return `**${numero}** — ${item.jogo} (${item.plataforma}) — ${dataItem}`;
      }

      return `**${numero}** — ${item.categoria} / ${item.subcategoria} (${item.plataforma}) — ${dataItem}`;
    })
    .join("\n");

  return new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle(
      tipo === "platina"
        ? `📘 Platinas de ${username}`
        : `🚗 Carreira GTA de ${username}`
    )
    .setDescription(texto || "Sem registos nesta página.")
    .setFooter({ text: `Página ${paginaSegura + 1} de ${totalPaginas}` });
}

function gerarBotoes(ownerId, targetId, tipo, pagina, totalPaginas) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`listar_pagina_${ownerId}_${targetId}_${tipo}_${Math.max(0, pagina - 1)}`)
      .setLabel("⬅️ Anterior")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pagina <= 0),
    new ButtonBuilder()
      .setCustomId(`listar_pagina_${ownerId}_${targetId}_${tipo}_${Math.min(totalPaginas - 1, pagina + 1)}`)
      .setLabel("Seguinte ➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pagina >= totalPaginas - 1)
  );
}

export async function execute(interaction) {
  const tipo = interaction.options.getString("tipo");
  const user = interaction.options.getUser("user");
  const games = await UserGames.findOne({ userId: user.id });

  if (!games) {
    return interaction.reply({
      content: "❌ Este utilizador ainda não tem registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content:
        tipo === "platina"
          ? "📭 O utilizador não tem nenhuma platina."
          : "📭 O utilizador não tem nenhuma entrada de carreira GTA.",
      ephemeral: true
    });
  }

  const pagina = 0;
  const totalPaginas = Math.ceil(lista.length / POR_PAGINA);

  return interaction.reply({
    embeds: [gerarEmbed(lista, tipo, user.username, pagina)],
    components: [gerarBotoes(interaction.user.id, user.id, tipo, pagina, totalPaginas)]
  });
}

export async function handleButton(interaction) {
  const match = interaction.customId.match(
    /^listar_pagina_(\d+)_(\d+)_(platina|carreira)_(\d+)$/
  );

  if (!match) return;

  const [, ownerId, targetId, tipo, paginaTexto] = match;

  if (interaction.user.id !== ownerId) {
    return interaction.reply({
      content: "❌ Não és tu que abriste esta lista.",
      ephemeral: true
    });
  }

  await interaction.deferUpdate();

  const [games, targetUser] = await Promise.all([
    UserGames.findOne({ userId: targetId }),
    interaction.client.users.fetch(targetId).catch(() => null)
  ]);

  if (!games) {
    return interaction.editReply({
      content: "❌ Os registos deste utilizador já não existem.",
      embeds: [],
      components: []
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  if (!lista || lista.length === 0) {
    return interaction.editReply({
      content: "📭 Esta lista já não tem registos.",
      embeds: [],
      components: []
    });
  }

  const totalPaginas = Math.ceil(lista.length / POR_PAGINA);
  const paginaPedida = Number(paginaTexto) || 0;
  const pagina = Math.min(Math.max(0, paginaPedida), totalPaginas - 1);
  const username = targetUser?.username || "utilizador";

  return interaction.editReply({
    content: "",
    embeds: [gerarEmbed(lista, tipo, username, pagina)],
    components: [gerarBotoes(ownerId, targetId, tipo, pagina, totalPaginas)]
  });
}

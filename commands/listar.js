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
          ? `📭 O utilizador não tem nenhuma platina.`
          : `📭 O utilizador não tem nenhuma entrada de carreira GTA.`,
      ephemeral: true
    });
  }

  // Paginação
  let pagina = 0;
  const porPagina = 10;
  const totalPaginas = Math.ceil(lista.length / porPagina);

  const gerarEmbed = () => {
    const inicio = pagina * porPagina;
    const fim = inicio + porPagina;
    const slice = lista.slice(inicio, fim);

    const texto = slice
      .map((item, i) => {
        const idReal = inicio + i;
        const numero = idReal + 1;

        if (tipo === "platina") {
          return `**${numero}** — ${item.jogo} (${item.plataforma}) — ${item.data || "sem data"}`;
        }

        // Carreira GTA
        return `**${numero}** — ${item.categoria} / ${item.subcategoria} (${item.plataforma}) — ${item.data || "sem data"}`;
      })
      .join("\n");

    return new EmbedBuilder()
      .setColor("#00A3FF")
      .setTitle(
        tipo === "platina"
          ? `📘 Platinas de ${user.username}`
          : `🚗 Carreira GTA de ${user.username}`
      )
      .setDescription(texto)
      .setFooter({ text: `Página ${pagina + 1} de ${totalPaginas}` });
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("anterior")
      .setLabel("⬅️ Anterior")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pagina === 0),

    new ButtonBuilder()
      .setCustomId("seguinte")
      .setLabel("Seguinte ➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(pagina === totalPaginas - 1)
  );

  const msg = await interaction.reply({
    embeds: [gerarEmbed()],
    components: [row],
    fetchReply: true
  });

  const collector = msg.createMessageComponentCollector({
    time: 1000 * 60 * 5
  });

  collector.on("collect", async btn => {
    if (btn.user.id !== interaction.user.id)
      return btn.reply({ content: "❌ Não és tu que abriste isto.", ephemeral: true });

    if (btn.customId === "anterior" && pagina > 0) pagina--;
    if (btn.customId === "seguinte" && pagina < totalPaginas - 1) pagina++;

    const newRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("anterior")
        .setLabel("⬅️ Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 0),

      new ButtonBuilder()
        .setCustomId("seguinte")
        .setLabel("Seguinte ➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPaginas - 1)
    );

    await btn.update({
      embeds: [gerarEmbed()],
      components: [newRow]
    });
  });
}

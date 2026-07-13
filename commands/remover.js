import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
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

export async function execute(interaction) {
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

  let pagina = 0;
  const porPagina = 25;
  const totalPaginas = Math.ceil(lista.length / porPagina);

  const gerarMenu = () => {
    const inicio = pagina * porPagina;
    const fim = inicio + porPagina;
    const slice = lista.slice(inicio, fim);

    const options = slice.map((item, index) => {
      const realIndex = inicio + index;

      return {
        label:
          tipo === "platina"
            ? `${realIndex + 1} — ${item.jogo} (${item.plataforma})`
            : `${realIndex + 1} — ${item.categoria} / ${item.subcategoria} (${item.plataforma})`,
        value: `${userId}_${tipo}_${realIndex}`
      };
    });

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("remover_escolher_item")
        .setPlaceholder(`Página ${pagina + 1}/${totalPaginas}`)
        .addOptions(options)
    );
  };

  const gerarBotoes = () => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("remover_prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 0),

      new ButtonBuilder()
        .setCustomId("remover_next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPaginas - 1)
    );
  };

  const msg = await interaction.reply({
    content: `🗑 Escolhe a entrada de **${tipo}** que queres remover de **${user.username}**:`,
    components: [gerarMenu(), gerarBotoes()],
    fetchReply: true
  });

  const collector = msg.createMessageComponentCollector({
    time: 1000 * 60 * 5
  });

  collector.on("collect", async i => {
    await i.deferUpdate().catch(() => {});

    if (i.customId === "remover_prev") {
      pagina--;
      return i.editReply({
        components: [gerarMenu(), gerarBotoes()]
      });
    }

    if (i.customId === "remover_next") {
      pagina++;
      return i.editReply({
        components: [gerarMenu(), gerarBotoes()]
      });
    }

    if (i.customId === "remover_escolher_item") {
      const raw = i.values[0];
      const partes = raw.split("_");
      const idx = parseInt(partes[2]);

      const item = lista[idx];
      if (!item) {
        return i.editReply({
          content: "❌ Entrada inválida.",
          components: []
        });
      }

      // REMOVER
      if (tipo === "platina") games.platinas.splice(idx, 1);
      else games.carreira.splice(idx, 1);

      await games.save();

      // XP
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

      // EMBED FINAL
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
        );

      return i.editReply({
        content: "",
        embeds: [embed],
        components: []
      });
    }
  });
}

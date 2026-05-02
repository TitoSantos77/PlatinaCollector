import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("editar")
  .setDescription("Editar uma platina ou conquista (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres editar?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Conquista", value: "conquista" }
      )
  );

export async function execute(interaction) {
  const tipo = interaction.options.getString("tipo");
  const user = interaction.user;

  const games = await UserGames.findOne({ userId: user.id });
  if (!games) {
    return interaction.reply({
      content: "❌ Ainda não tens registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.conquistas;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 Não tens nenhuma ${tipo} para editar.`,
      ephemeral: true
    });
  }

  // Criar select menu com todas as platinas/conquistas
  const options = lista.map((item, index) => ({
    label: `${index + 1} — ${item.jogo} (${item.plataforma})`,
    value: String(index)
  }));

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("editar_escolher_item")
      .setPlaceholder("Escolhe a entrada que queres editar")
      .addOptions(options)
  );

  await interaction.reply({
    content: `Escolhe a ${tipo} que queres editar:`,
    components: [row],
    ephemeral: true
  });
}

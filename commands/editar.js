import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  AttachmentBuilder
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

// =========================
// EXECUTAR /EDITAR
// =========================
export async function execute(interaction) {
  const tipo = interaction.options.getString("tipo");
  const userId = interaction.user.id;

  const games = await UserGames.findOne({ userId });
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

  // Criar select menu com todas as entradas
  const options = lista.map((item, index) => ({
    label: `${index + 1} — ${item.jogo} (${item.plataforma})`,
    value: `${tipo}_${index}`
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

// =========================
// SELECT MENU 1 — ESCOLHER ITEM
// =========================
export async function handleSelect(interaction) {
  if (interaction.customId !== "editar_escolher_item") return;

  const [tipo, index] = interaction.values[0].split("_");

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`editar_opcao_${tipo}_${index}`)
      .setPlaceholder("O que queres editar?")
      .addOptions([
        { label: "Jogo", value: "jogo" },
        { label: "Plataforma", value: "plataforma" },
        { label: "Imagem", value: "imagem" }
      ])
  );

  await interaction.update({
    content: "Escolhe o que queres editar:",
    components: [row]
  });
}

// =========================
// SELECT MENU 2 — ESCOLHER CAMPO
// =========================
export async function handleSelectCampo(interaction) {
  if (!interaction.customId.startsWith("editar_opcao_")) return;

  const [_, __, tipo, index] = interaction.customId.split("_");
  const campo = interaction.values[0];

  // IMAGEM → pedir upload
  if (campo === "imagem") {
    return interaction.update({
      content: "Envia a nova imagem da platina/conquista:",
      components: [],
      ephemeral: true
    });
  }

  // JOGO / PLATAFORMA → modal
  const modal = new ModalBuilder()
    .setCustomId(`editar_modal_${tipo}_${index}_${campo}`)
    .setTitle("Editar");

  const input = new TextInputBuilder()
    .setCustomId("valor")
    .setLabel(campo === "jogo" ? "Novo nome do jogo" : "Nova plataforma")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));

  await interaction.showModal(modal);
}

// =========================
// MODAL — APLICAR EDIÇÃO
// =========================
export async function handleModal(interaction) {
  if (!interaction.customId.startsWith("editar_modal_")) return;

  const [_, __, tipo, index, campo] = interaction.customId.split("_");
  const valor = interaction.fields.getTextInputValue("valor");

  const userId = interaction.user.id;

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  const lista = tipo === "platina" ? games.platinas : games.conquistas;
  const item = lista[index];

  const antes = `${item.jogo} (${item.plataforma})`;

  if (campo === "jogo") item.jogo = valor;
  if (campo === "plataforma") item.plataforma = valor;

  await games.save();

  // Atualizar última platina/conquista
  if (tipo === "platina") stats.ultimaPlatina = lista[lista.length - 1];
  else stats.ultimaConquista = lista[lista.length - 1];

  await stats.save();

  const depois = `${item.jogo} (${item.plataforma})`;

  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🛠 Entrada editada!")
    .addFields(
      { name: "Antes", value: antes },
      { name: "Depois", value: depois }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// =========================
// IMAGEM — APLICAR EDIÇÃO
// =========================
export async function handleImage(interaction) {
  if (!interaction.isMessage()) return;
  if (!interaction.reference) return;

  const replied = await interaction.channel.messages.fetch(interaction.reference.messageId);
  if (!replied.content.includes("Envia a nova imagem")) return;

  const attachment = interaction.attachments.first();
  if (!attachment || !attachment.contentType.startsWith("image/")) {
    return interaction.reply({ content: "❌ Isso não é uma imagem válida.", ephemeral: true });
  }

  const userId = interaction.author.id;

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  // Encontrar qual item estava a ser editado
  const match = replied.content.match(/editar_opcao_(platina|conquista)_(\d+)/);
  if (!match) return;

  const tipo = match[1];
  const index = parseInt(match[2]);

  const lista = tipo === "platina" ? games.platinas : games.conquistas;
  const item = lista[index];

  const antes = `${item.jogo} (${item.plataforma})`;

  item.imagem = attachment.url;

  await games.save();

  if (tipo === "platina") stats.ultimaPlatina = lista[lista.length - 1];
  else stats.ultimaConquista = lista[lista.length - 1];

  await stats.save();

  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🛠 Imagem atualizada!")
    .setDescription(`A imagem da entrada **${index + 1}** foi atualizada.`)
    .setImage(attachment.url);

  await interaction.reply({ embeds: [embed] });
}

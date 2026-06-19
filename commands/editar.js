import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("editar")
  .setDescription("Editar uma platina ou proeza")
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres editar?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Proeza", value: "proeza" }
      )
  )
  .addUserOption(opt =>
    opt
      .setName("user")
      .setDescription("Utilizador alvo (deixa vazio para editar as tuas)")
      .setRequired(false)
  );

// =========================
// EXECUTAR /EDITAR
// =========================
export async function execute(interaction) {
  const tipo = interaction.options.getString("tipo");
  const targetUser = interaction.options.getUser("user") || interaction.user;

  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (targetUser.id !== interaction.user.id && !isAdmin) {
    return interaction.reply({
      content: "❌ Só podes editar as TUAS próprias platinas/proezas.",
      ephemeral: true
    });
  }

  const userId = targetUser.id;

  const games = await UserGames.findOne({ userId });
  if (!games) {
    return interaction.reply({
      content: "❌ Este utilizador não tem registos.",
      ephemeral: true
    });
  }

  const lista = tipo === "platina" ? games.platinas : games.proezas;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 O utilizador não tem nenhuma ${tipo} para editar.`,
      ephemeral: true
    });
  }

  const options = lista.map((item, index) => ({
    label: `${index + 1} — ${item.jogo} (${item.plataforma})`,
    value: `${userId}_${tipo}_${index}`
  }));

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("editar_escolher_item")
      .setPlaceholder("Escolhe a entrada que queres editar")
      .addOptions(options)
  );

  await interaction.reply({
    content: `Escolhe a ${tipo} que queres editar de **${targetUser.username}**:`,
    components: [row],
    ephemeral: true
  });
}

// =========================
// SELECT MENU 1 — ESCOLHER ITEM
// =========================
export async function handleSelect(interaction) {
  if (interaction.customId !== "editar_escolher_item") return;

  const [userId, tipo, index] = interaction.values[0].split("_");

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`editar_opcao_${userId}_${tipo}_${index}`)
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

  const parts = interaction.customId.split("_");
  const userId = parts[2];
  const tipo = parts[3];
  const index = parts[4];

  const campo = interaction.values[0];

  if (campo === "imagem") {
    return interaction.update({
      content: `Envia a nova imagem da entrada (UserID: ${userId}, Tipo: ${tipo}, Index: ${index})`,
      components: [],
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`editar_modal_${userId}_${tipo}_${index}_${campo}`)
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

  const parts = interaction.customId.split("_");
  const userId = parts[2];
  const tipo = parts[3];
  const index = parseInt(parts[4], 10);
  const campo = parts[5];

  const valor = interaction.fields.getTextInputValue("valor");

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  const lista = tipo === "platina" ? games.platinas : games.proezas;
  const item = lista[index];

  if (!item) {
    return interaction.reply({
      content: "❌ Entrada inválida.",
      ephemeral: true
    });
  }

  const antes = `${item.jogo} (${item.plataforma})`;

  if (campo === "jogo") item.jogo = valor;
  if (campo === "plataforma") item.plataforma = valor;

  await games.save();

  if (tipo === "platina") stats.ultimaPlatina = lista[lista.length - 1] || null;
  else stats.ultimaProeza = lista[lista.length - 1] || null;

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
export async function handleImage(message) {
  if (!message.reference) return;

  const replied = await message.channel.messages.fetch(message.reference.messageId);

  const match = replied.content.match(/UserID: (\d+), Tipo: (platina|proeza), Index: (\d+)/);
  if (!match) return;

  const userId = match[1];
  const tipo = match[2];
  const index = parseInt(match[3], 10);

  const attachment = message.attachments.first();
  if (!attachment || !attachment.contentType?.startsWith("image/")) {
    return message.reply({ content: "❌ Isso não é uma imagem válida." });
  }

  const games = await UserGames.findOne({ userId });
  const stats = await UserStats.findOne({ userId });

  const lista = tipo === "platina" ? games.platinas : games.proezas;
  const item = lista[index];

  if (!item) {
    return message.reply({ content: "❌ Entrada inválida." });
  }

  item.imagem = attachment.url;

  await games.save();

  if (tipo === "platina") stats.ultimaPlatina = lista[lista.length - 1] || null;
  else stats.ultimaProeza = lista[lista.length - 1] || null;

  await stats.save();

  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🛠 Imagem atualizada!")
    .setDescription(`A imagem da entrada **${index + 1}** foi atualizada.`)
    .setImage(attachment.url);

  await message.reply({ embeds: [embed] });
}

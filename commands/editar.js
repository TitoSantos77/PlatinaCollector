import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
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
  .setDescription("Editar uma platina ou entrada da carreira GTA")
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("O que queres editar?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Carreira GTA", value: "carreira" }
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
      content: "❌ Só podes editar as TUAS próprias entradas.",
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

  const lista = tipo === "platina" ? games.platinas : games.carreira;

  if (!lista || lista.length === 0) {
    return interaction.reply({
      content: `📭 O utilizador não tem nenhuma entrada de ${tipo} para editar.`,
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
        .setCustomId("editar_escolher_item")
        .setPlaceholder(`Página ${pagina + 1}/${totalPaginas}`)
        .addOptions(options)
    );
  };

  const gerarBotoes = () => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("editar_prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 0),

      new ButtonBuilder()
        .setCustomId("editar_next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPaginas - 1)
    );
  };

  const msg = await interaction.reply({
    content: `✏️ Escolhe a entrada de **${tipo}** que queres editar de **${targetUser.username}**:`,
    components: [gerarMenu(), gerarBotoes()],
    fetchReply: true
  });

  const collector = msg.createMessageComponentCollector({
    time: 1000 * 60 * 5
  });

  collector.on("collect", async i => {
    await i.deferUpdate().catch(() => {});

    if (i.customId === "editar_prev") {
      pagina--;
      return i.editReply({
        components: [gerarMenu(), gerarBotoes()]
      });
    }

    if (i.customId === "editar_next") {
      pagina++;
      return i.editReply({
        components: [gerarMenu(), gerarBotoes()]
      });
    }

    if (i.customId === "editar_escolher_item") {
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

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`editar_opcao_${userId}_${tipo}_${idx}`)
          .setPlaceholder("O que queres editar?")
          .addOptions(
            tipo === "platina"
              ? [
                  { label: "Jogo", value: "jogo" },
                  { label: "Plataforma", value: "plataforma" },
                  { label: "Imagem", value: "imagem" }
                ]
              : [
                  { label: "Categoria", value: "categoria" },
                  { label: "Subcategoria", value: "subcategoria" },
                  { label: "Plataforma", value: "plataforma" },
                  { label: "Imagem", value: "imagem" }
                ]
          )
      );

      return i.editReply({
        content: "Escolhe o que queres editar:",
        components: [row]
      });
    }
  });
}

// =========================
// SELECT MENU 2 — ESCOLHER CAMPO
// =========================
export async function handleSelectCampo(interaction) {
  if (!interaction.customId.startsWith("editar_opcao_")) return;

  await interaction.deferUpdate().catch(() => {});

  const parts = interaction.customId.split("_");
  const userId = parts[2];
  const tipo = parts[3];
  const index = parts[4];

  const campo = interaction.values[0];

  if (campo === "imagem") {
    await interaction.editReply({
      content: "📸 Vamos atualizar a imagem!",
      components: []
    });

    return interaction.followUp({
      content:
        "📸 **Atualizar imagem da entrada**\n\n" +
        "➡️ **RESPONDE a esta mensagem** com a nova imagem.\n" +
        `\n(ID interno: UserID: ${userId}, Tipo: ${tipo}, Index: ${index})`,
      ephemeral: false
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`editar_modal_${userId}_${tipo}_${index}_${campo}`)
    .setTitle("Editar");

  const input = new TextInputBuilder()
    .setCustomId("valor")
    .setLabel(`Novo valor para ${campo}`)
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

  const lista = tipo === "platina" ? games.platinas : games.carreira;
  const item = lista[index];

  if (!item) {
    return interaction.reply({
      content: "❌ Entrada inválida.",
      ephemeral: true
    });
  }

  const antes =
    tipo === "platina"
      ? `${item.jogo} (${item.plataforma})`
      : `${item.categoria} / ${item.subcategoria} (${item.plataforma})`;

  item[campo] = valor;

  await games.save();

  if (tipo === "platina") stats.ultimaPlatina = lista.at(-1) || null;
  else stats.ultimaCarreira = lista.at(-1) || null;

  await stats.save();

  const depois =
    tipo === "platina"
      ? `${item.jogo} (${item.plataforma})`
      : `${item.categoria} / ${item.subcategoria} (${item.plataforma})`;

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

  let replied;
  try {
    replied = await message.channel.messages.fetch(message.reference.messageId);
  } catch (err) {
    return message.reply("❌ Não consegui encontrar a mensagem original. Tenta novamente.");
  }

  const match = replied.content.match(/UserID: (\d+), Tipo: (platina|carreira), Index: (\d+)/);
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

  const lista = tipo === "platina" ? games.platinas : games.carreira;
  const item = lista[index];

  if (!item) {
    return message.reply({ content: "❌ Entrada inválida." });
  }

  item.imagem = attachment.url;

  await games.save();

  if (tipo === "platina") stats.ultimaPlatina = lista.at(-1) || null;
  else stats.ultimaCarreira = lista.at(-1) || null;

  await stats.save();

  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🛠 Imagem atualizada!")
    .setDescription(`A imagem da entrada **${index + 1}** foi atualizada.`)
    .setImage(attachment.url);

  await message.reply({ embeds: [embed] });
}

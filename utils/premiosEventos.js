import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { randomUUID } from "crypto";
import PremioEvento from "../models/PremioEvento.js";
import { entregarPremioEvento, obterConfigPremios } from "./premios.js";
import { criarBackup } from "./backup.js";

function eAdmin(interaction) {
  return interaction.member?.permissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

async function negarAdmin(interaction) {
  return interaction.reply({
    content: "❌ Apenas administradores podem gerir eventos de prémios.",
    ephemeral: true
  });
}

function eventoDentroDoPrazo(evento) {
  return Boolean(evento?.ativo && new Date(evento.terminaEm).getTime() > Date.now());
}

async function obterEventoAtual(guildId) {
  const evento = await PremioEvento.findOne({ guildId });
  if (!evento) return null;

  if (evento.ativo && !eventoDentroDoPrazo(evento)) {
    evento.ativo = false;
    evento.encerradoEm = evento.encerradoEm || evento.terminaEm || new Date();
    await evento.save();
  }

  return evento;
}

function botaoParticipar(evento, desativado = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`premios_evento_participar_${evento.token}`)
      .setLabel("Receber prémio aleatório")
      .setEmoji("🎁")
      .setStyle(ButtonStyle.Success)
      .setDisabled(desativado)
  );
}

function embedEvento(evento, estado = "ativo") {
  const termina = Math.floor(new Date(evento.terminaEm).getTime() / 1000);
  const criado = Math.floor(new Date(evento.criadoEm).getTime() / 1000);

  let descricao =
    "Clica no botão abaixo para receber **um prémio aleatório**.\n" +
    "Cada membro pode participar **uma única vez** neste evento.";
  let cor = "#F5C400";

  if (estado === "terminado") {
    descricao = "⌛ Este evento terminou. Já não aceita novas participações.";
    cor = "#777777";
  } else if (estado === "encerrado") {
    descricao = "⛔ Este evento foi encerrado por um administrador.";
    cor = "#777777";
  }

  return new EmbedBuilder()
    .setColor(cor)
    .setTitle(`🎉 ${evento.nome}`)
    .setDescription(descricao)
    .addFields(
      { name: "🎁 Participações", value: `${evento.participantes.length}`, inline: true },
      { name: "⏳ Termina", value: `<t:${termina}:R>`, inline: true },
      { name: "📅 Prazo", value: `<t:${termina}:f>`, inline: false },
      { name: "👤 Criado por", value: `<@${evento.criadoPor}> · <t:${criado}:f>`, inline: false }
    );
}

async function atualizarMensagemEvento(client, evento, estado) {
  if (!evento.canalId || !evento.mensagemId) return;

  try {
    const canal = await client.channels.fetch(evento.canalId);
    if (!canal?.isTextBased()) return;

    const mensagem = await canal.messages.fetch(evento.mensagemId);
    await mensagem.edit({
      embeds: [embedEvento(evento, estado)],
      components: [botaoParticipar(evento, true)]
    });
  } catch (err) {
    console.error("Não foi possível atualizar a mensagem do evento de prémios:", err.message);
  }
}

export async function abrirPainelEvento(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const evento = await obterEventoAtual(interaction.guildId);
  const ativo = eventoDentroDoPrazo(evento);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("premios_evento_criar")
      .setLabel("Disparar evento")
      .setEmoji("🎉")
      .setStyle(ButtonStyle.Success)
      .setDisabled(ativo),
    new ButtonBuilder()
      .setCustomId("premios_evento_atual")
      .setLabel("Evento atual")
      .setEmoji("📋")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("premios_evento_encerrar")
      .setLabel("Encerrar evento")
      .setEmoji("⛔")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!ativo)
  );

  const embed = ativo
    ? embedEvento(evento)
    : new EmbedBuilder()
        .setColor("#777777")
        .setTitle("🎉 Evento de Prémios")
        .setDescription("Não existe nenhum evento de prémios ativo neste momento.");

  return interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
}

async function abrirModalCriarEvento(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const evento = await obterEventoAtual(interaction.guildId);
  if (eventoDentroDoPrazo(evento)) {
    return interaction.reply({
      content: `❌ Já existe um evento ativo: **${evento.nome}**. Encerra-o antes de criar outro.`,
      ephemeral: true
    });
  }

  const config = await obterConfigPremios(interaction.guildId);
  if (config.premios.length === 0) {
    return interaction.reply({
      content: "❌ Adiciona pelo menos um prémio antes de disparar um evento.",
      ephemeral: true
    });
  }

  const temManual = config.premios.some(p => p.tipo === "personalizado");
  if (temManual && !config.responsavelId) {
    return interaction.reply({
      content: "❌ Define primeiro o responsável pelos prémios de entrega manual.",
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("premios_evento_modal_criar")
    .setTitle("Disparar evento de prémios");

  const nome = new TextInputBuilder()
    .setCustomId("nome_evento")
    .setLabel("Nome do evento")
    .setPlaceholder("Ex.: Boas-vindas aos Prémios")
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(80)
    .setRequired(true);

  const duracao = new TextInputBuilder()
    .setCustomId("duracao_horas")
    .setLabel("Duração em horas")
    .setStyle(TextInputStyle.Short)
    .setValue("24")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nome),
    new ActionRowBuilder().addComponents(duracao)
  );

  return interaction.showModal(modal);
}

async function mostrarEventoAtual(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const evento = await obterEventoAtual(interaction.guildId);
  if (!eventoDentroDoPrazo(evento)) {
    return interaction.reply({
      content: "📋 Não existe nenhum evento de prémios ativo.",
      ephemeral: true
    });
  }

  return interaction.reply({
    embeds: [embedEvento(evento)],
    ephemeral: true
  });
}

async function encerrarEvento(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const evento = await obterEventoAtual(interaction.guildId);
  if (!eventoDentroDoPrazo(evento)) {
    return interaction.reply({
      content: "❌ Não existe nenhum evento ativo para encerrar.",
      ephemeral: true
    });
  }

  evento.ativo = false;
  evento.encerradoEm = new Date();
  await evento.save();
  await atualizarMensagemEvento(interaction.client, evento, "encerrado");
  criarBackup();

  return interaction.reply({
    content: `⛔ Evento **${evento.nome}** encerrado. Participações finais: **${evento.participantes.length}**.`,
    ephemeral: true
  });
}

function numeroInteiro(valor) {
  const texto = String(valor || "").trim();
  if (!/^\d+$/.test(texto)) return null;
  return Number(texto);
}

async function guardarEvento(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const nome = interaction.fields.getTextInputValue("nome_evento").trim();
  const duracaoHoras = numeroInteiro(interaction.fields.getTextInputValue("duracao_horas"));

  if (!nome) {
    return interaction.reply({ content: "❌ O nome do evento não pode ficar vazio.", ephemeral: true });
  }

  if (!duracaoHoras || duracaoHoras < 1 || duracaoHoras > 168) {
    return interaction.reply({
      content: "❌ A duração deve estar entre 1 e 168 horas.",
      ephemeral: true
    });
  }

  const atual = await obterEventoAtual(interaction.guildId);
  if (eventoDentroDoPrazo(atual)) {
    return interaction.reply({
      content: `❌ Já existe um evento ativo: **${atual.nome}**.`,
      ephemeral: true
    });
  }

  const config = await obterConfigPremios(interaction.guildId);
  if (config.premios.length === 0) {
    return interaction.reply({
      content: "❌ Já não existem prémios configurados. Adiciona pelo menos um antes de criar o evento.",
      ephemeral: true
    });
  }

  const temManual = config.premios.some(p => p.tipo === "personalizado");
  if (temManual && !config.responsavelId) {
    return interaction.reply({
      content: "❌ Define primeiro o responsável pelos prémios de entrega manual.",
      ephemeral: true
    });
  }

  const agora = new Date();
  const terminaEm = new Date(agora.getTime() + duracaoHoras * 60 * 60 * 1000);
  const token = randomUUID();
  const premios = config.premios.map(p => ({
    tipo: p.tipo,
    nome: p.nome,
    quantidade: Number(p.quantidade) || 0,
    peso: Number(p.peso) || 1
  }));

  const evento = await PremioEvento.findOneAndUpdate(
    { guildId: interaction.guildId },
    {
      $set: {
        token,
        nome,
        ativo: true,
        criadoPor: interaction.user.id,
        responsavelId: config.responsavelId || null,
        canalId: interaction.channelId,
        mensagemId: null,
        criadoEm: agora,
        terminaEm,
        encerradoEm: null,
        participantes: [],
        premios
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    const mensagem = await interaction.channel.send({
      embeds: [embedEvento(evento)],
      components: [botaoParticipar(evento)]
    });

    evento.mensagemId = mensagem.id;
    await evento.save();
  } catch (err) {
    evento.ativo = false;
    evento.encerradoEm = new Date();
    await evento.save();
    throw err;
  }

  criarBackup();

  const termina = Math.floor(terminaEm.getTime() / 1000);
  return interaction.reply({
    content: `✅ Evento **${nome}** disparado neste canal. Termina <t:${termina}:R>.`,
    ephemeral: true
  });
}

async function participarEvento(interaction) {
  const token = interaction.customId.replace("premios_evento_participar_", "");
  const agora = new Date();
  const atual = await PremioEvento.findOne({ guildId: interaction.guildId });

  if (!atual || atual.token !== token) {
    return interaction.reply({
      content: "❌ Este evento já não é o evento ativo.",
      ephemeral: true
    });
  }

  if (!atual.ativo) {
    return interaction.reply({
      content: "⛔ Este evento já foi encerrado.",
      ephemeral: true
    });
  }

  if (new Date(atual.terminaEm).getTime() <= agora.getTime()) {
    atual.ativo = false;
    atual.encerradoEm = atual.encerradoEm || atual.terminaEm || agora;
    await atual.save();
    criarBackup();

    try {
      await interaction.update({
        embeds: [embedEvento(atual, "terminado")],
        components: [botaoParticipar(atual, true)]
      });
      return interaction.followUp({
        content: "⌛ O prazo deste evento terminou.",
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content: "⌛ O prazo deste evento terminou.",
        ephemeral: true
      }).catch(() => {});
    }
  }

  if (atual.participantes.includes(interaction.user.id)) {
    return interaction.reply({
      content: "🎁 Já participaste neste evento. Uma participação por membro.",
      ephemeral: true
    });
  }

  const evento = await PremioEvento.findOneAndUpdate(
    {
      guildId: interaction.guildId,
      token,
      ativo: true,
      terminaEm: { $gt: agora },
      participantes: { $ne: interaction.user.id }
    },
    { $addToSet: { participantes: interaction.user.id } },
    { new: true }
  );

  if (!evento) {
    return interaction.reply({
      content: "🎁 Não foi possível registar a participação. Se já participaste, só tens uma tentativa neste evento.",
      ephemeral: true
    });
  }

  await interaction.deferUpdate();

  const entregue = await entregarPremioEvento(
    interaction,
    {
      premios: evento.premios,
      responsavelId: evento.responsavelId
    },
    interaction.user.id,
    evento.nome
  );

  if (!entregue) {
    console.error("Evento de prémios sem prémio válido:", evento.guildId, evento.nome);
    await interaction.followUp({
      content: "❌ Não existe nenhum prémio válido neste evento. Contacta um administrador.",
      ephemeral: true
    });
  }

  criarBackup();
}

export async function handleEventoButton(interaction) {
  if (interaction.customId === "premios_evento_painel") return abrirPainelEvento(interaction);
  if (interaction.customId === "premios_evento_criar") return abrirModalCriarEvento(interaction);
  if (interaction.customId === "premios_evento_atual") return mostrarEventoAtual(interaction);
  if (interaction.customId === "premios_evento_encerrar") return encerrarEvento(interaction);

  if (interaction.customId.startsWith("premios_evento_participar_")) {
    return participarEvento(interaction);
  }
}

export async function handleEventoModal(interaction) {
  if (interaction.customId === "premios_evento_modal_criar") {
    return guardarEvento(interaction);
  }
}

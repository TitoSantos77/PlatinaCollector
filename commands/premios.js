import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder
} from "discord.js";
import PremioRegisto from "../models/PremioRegisto.js";
import { obterConfigPremios, limparHistoricoPremios } from "../utils/premios.js";
import { abrirPainelEvento, handleEventoButton, handleEventoModal } from "../utils/premiosEventos.js";
import { criarBackup } from "../utils/backup.js";

export const data = new SlashCommandBuilder()
  .setName("premios")
  .setDescription("Abre o painel de prémios do PlatinaCollector");

function eAdmin(interaction) {
  return interaction.member?.permissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

async function negarAdmin(interaction) {
  return interaction.reply({
    content: "❌ Apenas administradores podem alterar o sistema de prémios.",
    ephemeral: true
  });
}

function painelPublico() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("premios_lista")
      .setLabel("Lista de prémios")
      .setEmoji("🎁")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("premios_historico")
      .setLabel("Histórico")
      .setEmoji("🕘")
      .setStyle(ButtonStyle.Secondary)
  );
}

function painelAdmin() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("premios_adicionar")
      .setLabel("Adicionar")
      .setEmoji("➕")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("premios_remover")
      .setLabel("Remover")
      .setEmoji("➖")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("premios_config")
      .setLabel("Configuração")
      .setEmoji("⚙️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("premios_pendentes")
      .setLabel("Pendentes")
      .setEmoji("📦")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("premios_evento_painel")
      .setLabel("Evento")
      .setEmoji("🎉")
      .setStyle(ButtonStyle.Primary)
  );
}

function linhaVoltar() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("premios_voltar_menu")
      .setLabel("Voltar")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
  );
}

function resumoConfig(config) {
  const responsavel = config.responsavelId ? `<@${config.responsavelId}>` : "Não definido";

  return new EmbedBuilder()
    .setColor(config.ativo ? "#55DD88" : "#777777")
    .setTitle("🎁 Sistema de Prémios")
    .setDescription(config.ativo ? "Estado: **Ligado**" : "Estado: **Desligado**")
    .addFields(
      { name: "🏆 Platina", value: `${config.chancePlatina}%`, inline: true },
      { name: "🚗 Carreira GTA", value: `${config.chanceCarreira}%`, inline: true },
      { name: "📈 Subida de nível", value: `${config.chanceNivel}%`, inline: true },
      { name: "⏱️ Cooldown", value: `${config.cooldownSegundos}s`, inline: true },
      { name: "👤 Responsável manual", value: responsavel, inline: true },
      { name: "🎁 Prémios configurados", value: `${config.premios.length}`, inline: true }
    );
}

function componentesMenuPrincipal(interaction) {
  const components = [painelPublico()];
  if (eAdmin(interaction)) components.push(painelAdmin());
  return components;
}

function linhaConfig(config) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("premios_toggle")
      .setLabel(config.ativo ? "Desligar" : "Ligar")
      .setStyle(config.ativo ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("premios_definir_responsavel")
      .setLabel("Responsável")
      .setEmoji("👤")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("premios_definir_chances")
      .setLabel("Chances / Cooldown")
      .setEmoji("🎲")
      .setStyle(ButtonStyle.Secondary)
  );
}

export async function execute(interaction) {
  const config = await obterConfigPremios(interaction.guildId);

  return interaction.reply({
    embeds: [resumoConfig(config)],
    components: componentesMenuPrincipal(interaction),
    ephemeral: true
  });
}

async function voltarMenuPrincipal(interaction) {
  const config = await obterConfigPremios(interaction.guildId);

  return interaction.update({
    content: "",
    embeds: [resumoConfig(config)],
    components: componentesMenuPrincipal(interaction)
  });
}

async function mostrarLista(interaction) {
  const config = await obterConfigPremios(interaction.guildId);

  if (config.premios.length === 0) {
    return interaction.update({
      content: "🎁 Ainda não existem prémios configurados.",
      embeds: [],
      components: [linhaVoltar()]
    });
  }

  const linhas = config.premios.map((premio, index) => {
    if (premio.tipo === "xp") {
      return `**${index + 1}.** +${premio.quantidade} XP PlatinaCollector · automático`;
    }
    return `**${index + 1}.** ${premio.nome} · entrega manual`;
  });

  return interaction.update({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setColor("#FFD54A")
        .setTitle("🎁 Prémios disponíveis")
        .setDescription(linhas.join("\n"))
    ],
    components: [linhaVoltar()]
  });
}

async function mostrarHistorico(interaction) {
  const historico = await PremioRegisto.find({
    guildId: interaction.guildId,
    estado: "entregue"
  })
    .sort({ entregueEm: -1, _id: -1 })
    .limit(10)
    .lean();

  if (historico.length === 0) {
    return interaction.update({
      content: "🕘 Ainda não existem prémios entregues.",
      embeds: [],
      components: [linhaVoltar()]
    });
  }

  const linhas = historico.map(item => {
    const data = item.entregueEm || item.criadoEm;
    const timestamp = Math.floor(new Date(data).getTime() / 1000);
    const entrega = item.entreguePor === "automatico"
      ? "automático"
      : item.entreguePor
        ? `por <@${item.entreguePor}>`
        : "entregue";
    const evento = item.gatilho === "evento" && item.eventoNome
      ? ` · 🎉 ${item.eventoNome}`
      : "";

    return `• <@${item.userId}> · **${item.nome}** · ${entrega}${evento} · <t:${timestamp}:f>`;
  });

  return interaction.update({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setColor("#8EA7FF")
        .setTitle("🕘 Últimos 10 prémios entregues")
        .setDescription(linhas.join("\n"))
    ],
    components: [linhaVoltar()]
  });
}

async function abrirAdicionar(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);
  if (config.premios.length >= 25) {
    return interaction.update({
      content: "❌ O limite é 25 prémios configurados por servidor.",
      embeds: [],
      components: [linhaVoltar()]
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("premios_add_tipo")
    .setPlaceholder("Escolhe o tipo de prémio")
    .addOptions(
      {
        label: "XP PlatinaCollector",
        value: "xp",
        description: "Entregue automaticamente pelo bot",
        emoji: "⭐"
      },
      {
        label: "Prémio personalizado",
        value: "personalizado",
        description: "Entrega manual pelo responsável",
        emoji: "🎁"
      }
    );

  return interaction.update({
    content: "Escolhe o tipo de prémio que queres adicionar:",
    embeds: [],
    components: [new ActionRowBuilder().addComponents(menu), linhaVoltar()]
  });
}

async function abrirRemover(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);
  if (config.premios.length === 0) {
    return interaction.update({
      content: "❌ Não existem prémios para remover.",
      embeds: [],
      components: [linhaVoltar()]
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("premios_remover_select")
    .setPlaceholder("Escolhe o prémio a remover")
    .addOptions(
      config.premios.slice(0, 25).map(premio => ({
        label: premio.tipo === "xp" ? `+${premio.quantidade} XP PlatinaCollector` : premio.nome,
        value: premio._id.toString(),
        description: premio.tipo === "xp" ? "Automático" : "Entrega manual"
      }))
    );

  return interaction.update({
    content: "Escolhe o prémio que queres remover:",
    embeds: [],
    components: [new ActionRowBuilder().addComponents(menu), linhaVoltar()]
  });
}

async function abrirConfig(interaction, mensagem = "") {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);

  return interaction.update({
    content: mensagem,
    embeds: [resumoConfig(config)],
    components: [linhaConfig(config), linhaVoltar()]
  });
}

async function mostrarPendentes(interaction) {
  const config = await obterConfigPremios(interaction.guildId);
  const autorizado = eAdmin(interaction) || config.responsavelId === interaction.user.id;

  if (!autorizado) {
    return interaction.reply({
      content: "❌ Apenas administradores ou o responsável pelos prémios podem consultar os pendentes.",
      ephemeral: true
    });
  }

  const total = await PremioRegisto.countDocuments({
    guildId: interaction.guildId,
    estado: "pendente"
  });

  const pendentes = await PremioRegisto.find({
    guildId: interaction.guildId,
    estado: "pendente"
  })
    .sort({ criadoEm: -1 })
    .limit(10)
    .lean();

  if (pendentes.length === 0) {
    return interaction.update({
      content: "📦 Não existem prémios pendentes.",
      embeds: [],
      components: [linhaVoltar()]
    });
  }

  const linhas = pendentes.map(item => {
    const timestamp = Math.floor(new Date(item.criadoEm).getTime() / 1000);
    const evento = item.gatilho === "evento" && item.eventoNome
      ? ` · 🎉 ${item.eventoNome}`
      : "";
    return `• <@${item.userId}> · **${item.nome}**${evento} · <t:${timestamp}:f>`;
  });

  const rodape = total > 10 ? `\n\nA mostrar os 10 mais recentes de **${total}** pendentes.` : "";

  return interaction.update({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setColor("#FFD54A")
        .setTitle("📦 Prémios pendentes")
        .setDescription(linhas.join("\n") + rodape)
    ],
    components: [linhaVoltar()]
  });
}

async function alternarSistema(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);

  if (!config.ativo) {
    if (config.premios.length === 0) {
      return interaction.reply({
        content: "❌ Adiciona pelo menos um prémio antes de ligar o sistema.",
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
  }

  config.ativo = !config.ativo;
  await config.save();
  criarBackup();

  return abrirConfig(
    interaction,
    config.ativo ? "✅ Sistema de prémios ligado." : "⛔ Sistema de prémios desligado."
  );
}

async function escolherResponsavel(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const menu = new UserSelectMenuBuilder()
    .setCustomId("premios_responsavel_select")
    .setPlaceholder("Escolhe o responsável pelas entregas manuais")
    .setMinValues(1)
    .setMaxValues(1);

  return interaction.update({
    content: "Escolhe quem será notificado e poderá marcar os prémios manuais como entregues:",
    embeds: [],
    components: [new ActionRowBuilder().addComponents(menu), linhaVoltar()]
  });
}

async function abrirModalChances(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);
  const modal = new ModalBuilder()
    .setCustomId("premios_modal_chances")
    .setTitle("Chances e cooldown");

  const platina = new TextInputBuilder()
    .setCustomId("chance_platina")
    .setLabel("Chance Platina (%)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(String(config.chancePlatina));

  const carreira = new TextInputBuilder()
    .setCustomId("chance_carreira")
    .setLabel("Chance Carreira GTA (%)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(String(config.chanceCarreira));

  const nivel = new TextInputBuilder()
    .setCustomId("chance_nivel")
    .setLabel("Chance Subida de nível (%)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(String(config.chanceNivel));

  const cooldown = new TextInputBuilder()
    .setCustomId("cooldown")
    .setLabel("Cooldown em segundos")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(String(config.cooldownSegundos));

  modal.addComponents(
    new ActionRowBuilder().addComponents(platina),
    new ActionRowBuilder().addComponents(carreira),
    new ActionRowBuilder().addComponents(nivel),
    new ActionRowBuilder().addComponents(cooldown)
  );

  return interaction.showModal(modal);
}

async function marcarEntregue(interaction) {
  const id = interaction.customId.replace("premios_entregue_", "");
  const registo = await PremioRegisto.findById(id);

  if (!registo || registo.estado !== "pendente") {
    return interaction.reply({ content: "❌ Este prémio já não está pendente.", ephemeral: true });
  }

  if (!registo.responsavelId || registo.responsavelId !== interaction.user.id) {
    return interaction.reply({
      content: registo.responsavelId
        ? `❌ Apenas <@${registo.responsavelId}> pode confirmar a entrega deste prémio.`
        : "❌ Este prémio não tem responsável configurado.",
      ephemeral: true,
      allowedMentions: { parse: [] }
    });
  }

  registo.estado = "entregue";
  registo.entregueEm = new Date();
  registo.entreguePor = interaction.user.id;
  await registo.save();
  await limparHistoricoPremios(registo.guildId);
  criarBackup();

  const timestamp = Math.floor(registo.entregueEm.getTime() / 1000);
  const embed = new EmbedBuilder()
    .setColor("#55DD88")
    .setTitle("🎁 Prémio Aleatório!")
    .setDescription(`<@${registo.userId}> ganhou **${registo.nome}**`)
    .addFields(
      { name: "📦 Estado", value: "✅ Entregue", inline: true },
      { name: "👤 Entregue por", value: `<@${interaction.user.id}>`, inline: true },
      { name: "📅 Entregue em", value: `<t:${timestamp}:f>`, inline: false }
    );

  if (registo.gatilho === "evento" && registo.eventoNome) {
    embed.addFields({ name: "🎉 Evento", value: registo.eventoNome, inline: false });
  }

  return interaction.update({
    content: "",
    embeds: [embed],
    components: []
  });
}

export async function handleButton(interaction) {
  if (interaction.customId === "premios_voltar_menu") return voltarMenuPrincipal(interaction);

  if (interaction.customId.startsWith("premios_evento_")) {
    return handleEventoButton(interaction);
  }

  if (interaction.customId === "premios_lista") return mostrarLista(interaction);
  if (interaction.customId === "premios_historico") return mostrarHistorico(interaction);
  if (interaction.customId === "premios_adicionar") return abrirAdicionar(interaction);
  if (interaction.customId === "premios_remover") return abrirRemover(interaction);
  if (interaction.customId === "premios_config") return abrirConfig(interaction);
  if (interaction.customId === "premios_pendentes") return mostrarPendentes(interaction);
  if (interaction.customId === "premios_toggle") return alternarSistema(interaction);
  if (interaction.customId === "premios_definir_responsavel") return escolherResponsavel(interaction);
  if (interaction.customId === "premios_definir_chances") return abrirModalChances(interaction);
  if (interaction.customId.startsWith("premios_entregue_")) return marcarEntregue(interaction);
}

export async function handleSelect(interaction) {
  if (interaction.customId === "premios_add_tipo") {
    if (!eAdmin(interaction)) return negarAdmin(interaction);

    const tipo = interaction.values[0];
    const modal = new ModalBuilder()
      .setCustomId(tipo === "xp" ? "premios_modal_add_xp" : "premios_modal_add_personalizado")
      .setTitle(tipo === "xp" ? "Adicionar XP PlatinaCollector" : "Adicionar prémio personalizado");

    if (tipo === "xp") {
      const quantidade = new TextInputBuilder()
        .setCustomId("quantidade")
        .setLabel("Quantidade de XP")
        .setPlaceholder("Ex.: 250")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const peso = new TextInputBuilder()
        .setCustomId("peso")
        .setLabel("Chance no sorteio")
        .setPlaceholder("Maior valor = maior chance. Ex.: 10")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(quantidade),
        new ActionRowBuilder().addComponents(peso)
      );
    } else {
      const nome = new TextInputBuilder()
        .setCustomId("nome")
        .setLabel("Nome do prémio")
        .setPlaceholder("Ex.: 500 VAGS")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(80)
        .setRequired(true);

      const peso = new TextInputBuilder()
        .setCustomId("peso")
        .setLabel("Chance no sorteio")
        .setPlaceholder("Maior valor = maior chance. Ex.: 10")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome),
        new ActionRowBuilder().addComponents(peso)
      );
    }

    return interaction.showModal(modal);
  }

  if (interaction.customId === "premios_remover_select") {
    if (!eAdmin(interaction)) return negarAdmin(interaction);

    const config = await obterConfigPremios(interaction.guildId);
    const id = interaction.values[0];
    const premio = config.premios.id(id);

    if (!premio) {
      return interaction.reply({ content: "❌ Prémio não encontrado.", ephemeral: true });
    }

    const nome = premio.tipo === "xp" ? `+${premio.quantidade} XP PlatinaCollector` : premio.nome;
    config.premios.pull({ _id: id });
    await config.save();
    criarBackup();

    return interaction.update({
      content: `✅ Prémio removido: **${nome}**`,
      embeds: [],
      components: [linhaVoltar()]
    });
  }
}

export async function handleUserSelect(interaction) {
  if (interaction.customId !== "premios_responsavel_select") return;
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const responsavelId = interaction.values[0];
  const config = await obterConfigPremios(interaction.guildId);
  config.responsavelId = responsavelId;
  await config.save();
  criarBackup();

  const atualizado = await obterConfigPremios(interaction.guildId);
  return interaction.update({
    content: `✅ Responsável pelos prémios manuais definido: <@${responsavelId}>`,
    embeds: [resumoConfig(atualizado)],
    components: [linhaConfig(atualizado), linhaVoltar()],
    allowedMentions: { parse: [] }
  });
}

function numeroInteiro(valor) {
  if (!/^\d+$/.test(valor.trim())) return null;
  return Number(valor);
}

async function guardarPremio(interaction, tipo) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const config = await obterConfigPremios(interaction.guildId);
  if (config.premios.length >= 25) {
    return interaction.reply({
      content: "❌ O limite é 25 prémios por servidor.",
      components: [linhaVoltar()],
      ephemeral: true
    });
  }

  const peso = numeroInteiro(interaction.fields.getTextInputValue("peso"));
  if (!peso || peso < 1 || peso > 1000) {
    return interaction.reply({
      content: "❌ A chance no sorteio deve ser um número entre 1 e 1000.",
      components: [linhaVoltar()],
      ephemeral: true
    });
  }

  let nome;
  let quantidade = 0;

  if (tipo === "xp") {
    quantidade = numeroInteiro(interaction.fields.getTextInputValue("quantidade"));
    if (!quantidade || quantidade < 1 || quantidade > 100000) {
      return interaction.reply({
        content: "❌ A quantidade de XP deve estar entre 1 e 100000.",
        components: [linhaVoltar()],
        ephemeral: true
      });
    }
    nome = `+${quantidade} XP PlatinaCollector`;
  } else {
    nome = interaction.fields.getTextInputValue("nome").trim();
    if (!nome) {
      return interaction.reply({
        content: "❌ O nome do prémio não pode ficar vazio.",
        components: [linhaVoltar()],
        ephemeral: true
      });
    }
  }

  const duplicado = config.premios.some(p => p.nome.toLowerCase() === nome.toLowerCase());
  if (duplicado) {
    return interaction.reply({
      content: "❌ Já existe um prémio com esse nome.",
      components: [linhaVoltar()],
      ephemeral: true
    });
  }

  config.premios.push({ tipo, nome, quantidade, peso });
  await config.save();
  criarBackup();

  return interaction.reply({
    content: `✅ Prémio adicionado: **${nome}** · chance ${peso}`,
    components: [linhaVoltar()],
    ephemeral: true
  });
}

async function guardarChances(interaction) {
  if (!eAdmin(interaction)) return negarAdmin(interaction);

  const chancePlatina = numeroInteiro(interaction.fields.getTextInputValue("chance_platina"));
  const chanceCarreira = numeroInteiro(interaction.fields.getTextInputValue("chance_carreira"));
  const chanceNivel = numeroInteiro(interaction.fields.getTextInputValue("chance_nivel"));
  const cooldown = numeroInteiro(interaction.fields.getTextInputValue("cooldown"));

  const chances = [chancePlatina, chanceCarreira, chanceNivel];
  if (chances.some(valor => valor === null || valor < 0 || valor > 100)) {
    return interaction.reply({
      content: "❌ As chances têm de estar entre 0 e 100.",
      components: [linhaVoltar()],
      ephemeral: true
    });
  }

  if (cooldown === null || cooldown < 0 || cooldown > 600) {
    return interaction.reply({
      content: "❌ O cooldown deve estar entre 0 e 600 segundos.",
      components: [linhaVoltar()],
      ephemeral: true
    });
  }

  const config = await obterConfigPremios(interaction.guildId);
  config.chancePlatina = chancePlatina;
  config.chanceCarreira = chanceCarreira;
  config.chanceNivel = chanceNivel;
  config.cooldownSegundos = cooldown;
  await config.save();
  criarBackup();

  return interaction.reply({
    content: `✅ Configuração atualizada. Platina ${chancePlatina}% · Carreira ${chanceCarreira}% · Nível ${chanceNivel}% · Cooldown ${cooldown}s`,
    components: [linhaVoltar()],
    ephemeral: true
  });
}

export async function handleModal(interaction) {
  if (interaction.customId.startsWith("premios_evento_modal_")) {
    return handleEventoModal(interaction);
  }

  if (interaction.customId === "premios_modal_add_xp") {
    return guardarPremio(interaction, "xp");
  }

  if (interaction.customId === "premios_modal_add_personalizado") {
    return guardarPremio(interaction, "personalizado");
  }

  if (interaction.customId === "premios_modal_chances") {
    return guardarChances(interaction);
  }
}

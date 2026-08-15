import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";
import PremiosConfig from "../models/PremiosConfig.js";
import PremioRegisto from "../models/PremioRegisto.js";
import { adicionarXP, xpNecessario } from "./xp.js";
import UserStats from "../models/UserStats.js";

const ultimoSorteio = new Map();

export async function obterConfigPremios(guildId) {
  if (!guildId) return null;

  return PremiosConfig.findOneAndUpdate(
    { guildId },
    { $setOnInsert: { guildId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function chanceDoGatilho(config, gatilho) {
  if (gatilho === "platina") return config.chancePlatina;
  if (gatilho === "carreira") return config.chanceCarreira;
  if (gatilho === "nivel") return config.chanceNivel;
  return 0;
}

function nomeGatilho(gatilho) {
  if (gatilho === "platina") return "Nova Platina";
  if (gatilho === "carreira") return "Carreira GTA";
  return "Subida de nível";
}

function sortearPremio(premios) {
  const validos = premios.filter(p => Number(p.peso) > 0);
  if (validos.length === 0) return null;

  const total = validos.reduce((acc, premio) => acc + Number(premio.peso), 0);
  let sorteio = Math.random() * total;

  for (const premio of validos) {
    sorteio -= Number(premio.peso);
    if (sorteio <= 0) return premio;
  }

  return validos[validos.length - 1];
}

function barraXP(xp, necessario) {
  const totalBlocos = 10;
  const percentagem = necessario > 0 ? Math.min(1, xp / necessario) : 0;
  const cheios = Math.round(percentagem * totalBlocos);
  return `${"█".repeat(cheios)}${"░".repeat(totalBlocos - cheios)}`;
}

export async function limparHistoricoPremios(guildId) {
  const entregues = await PremioRegisto.find({ guildId, estado: "entregue" })
    .sort({ entregueEm: -1, _id: -1 })
    .select("_id")
    .lean();

  if (entregues.length <= 10) return;

  await PremioRegisto.deleteMany({
    _id: { $in: entregues.slice(10).map(item => item._id) }
  });
}

async function entregarXP(interaction, premio, userId, gatilho) {
  const antes = await UserStats.findOne({ userId }).lean();
  const nivelAntes = Number(antes?.nivel) || 1;
  const quantidade = Math.max(1, Number(premio.quantidade) || 0);
  const stats = await adicionarXP(userId, quantidade);
  const necessario = xpNecessario(stats.nivel);

  await PremioRegisto.create({
    guildId: interaction.guildId,
    userId,
    tipo: "xp",
    nome: premio.nome,
    quantidade,
    gatilho,
    estado: "entregue",
    entregueEm: new Date(),
    entreguePor: "automatico"
  });

  await limparHistoricoPremios(interaction.guildId);

  const embed = new EmbedBuilder()
    .setColor("#7CFF6B")
    .setTitle("🎁 Prémio Aleatório!")
    .setDescription(`<@${userId}> ganhou **+${quantidade} XP PlatinaCollector**`)
    .addFields(
      { name: "🎯 Gatilho", value: nomeGatilho(gatilho), inline: true },
      { name: "📈 Nível", value: `${stats.nivel}`, inline: true },
      { name: "⭐ XP Total", value: `${stats.totalXP} XP`, inline: true },
      {
        name: "Progresso",
        value: `${barraXP(stats.xp, necessario)}  ${stats.xp}/${necessario} XP`,
        inline: false
      },
      {
        name: "Estado",
        value: "✅ Entregue automaticamente",
        inline: false
      }
    )
    .setTimestamp();

  if (stats.nivel > nivelAntes) {
    embed.addFields({
      name: "🚀 Subida de nível",
      value: `Subiu para o **Nível ${stats.nivel}** com o prémio.`,
      inline: false
    });
  }

  await interaction.followUp({ embeds: [embed] });
}

async function criarPremioManual(interaction, config, premio, userId, gatilho) {
  const registo = await PremioRegisto.create({
    guildId: interaction.guildId,
    userId,
    tipo: "personalizado",
    nome: premio.nome,
    quantidade: 0,
    gatilho,
    estado: "pendente",
    responsavelId: config.responsavelId || null
  });

  const embed = new EmbedBuilder()
    .setColor("#FFD54A")
    .setTitle("🎁 Prémio Aleatório!")
    .setDescription(`<@${userId}> ganhou **${premio.nome}**`)
    .addFields(
      { name: "🎯 Gatilho", value: nomeGatilho(gatilho), inline: true },
      { name: "📦 Estado", value: "Pendente", inline: true },
      {
        name: "👤 Responsável",
        value: config.responsavelId ? `<@${config.responsavelId}>` : "Não configurado",
        inline: false
      }
    )
    .setTimestamp();

  const components = [];

  if (config.responsavelId) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`premios_entregue_${registo._id}`)
          .setLabel("Marcar como entregue")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success)
      )
    );
  }

  await interaction.followUp({
    content: config.responsavelId ? `<@${config.responsavelId}>, tens um prémio para entregar.` : "",
    embeds: [embed],
    components,
    allowedMentions: config.responsavelId ? { users: [config.responsavelId] } : { parse: [] }
  });
}

async function executarSorteio(interaction, config, userId, gatilho) {
  const chance = Number(chanceDoGatilho(config, gatilho)) || 0;
  if (chance <= 0 || Math.random() * 100 >= chance) return false;

  const premio = sortearPremio(config.premios);
  if (!premio) return false;

  if (premio.tipo === "xp") {
    await entregarXP(interaction, premio, userId, gatilho);
  } else {
    await criarPremioManual(interaction, config, premio, userId, gatilho);
  }

  return true;
}

export async function processarSorteiosPremios(
  interaction,
  { userId, gatilhoPrincipal, nivelSubiu = false }
) {
  const guildId = interaction.guildId;
  if (!guildId) return;

  const config = await PremiosConfig.findOne({ guildId });
  if (!config?.ativo || config.premios.length === 0) return;

  const chaveCooldown = `${guildId}:${userId}`;
  const agora = Date.now();
  const ultimo = ultimoSorteio.get(chaveCooldown) || 0;
  const cooldownMs = Math.max(0, Number(config.cooldownSegundos) || 0) * 1000;

  if (agora - ultimo < cooldownMs) return;
  ultimoSorteio.set(chaveCooldown, agora);

  await executarSorteio(interaction, config, userId, gatilhoPrincipal);

  if (nivelSubiu) {
    await executarSorteio(interaction, config, userId, "nivel");
  }
}

import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import { adicionarXP, xpNecessario } from "../utils/xp.js";
import { atualizarProgresso } from "../utils/missions.js";
import { criarBackup } from "../utils/backup.js";
import { verificarBadges } from "../utils/badges.js";

import {
  adicionarCategoriaCarreira,
  adicionarSubcategoriaCarreira,
  adicionarPlataformaCarreira
} from "../utils/globalStats.js";

import { atualizarStatsCarreira } from "../utils/userStats.js";

import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

// XP fixo para carreira
const XP_CARREIRA = 75;

// Categorias e subcategorias oficiais PT‑BR
const categorias = {
  "Missões de Contato": [
    "A Safehouse in the Hills",
    "Oscar Guzman Decolando de Novo",
    "Invasão ao Aviário Cluckin’ Bell",
    "A Saideira de Gerald",
    "Retomada Premium Deluxe do Simeon",
    "Serviços de Despache do Madrazo",
    "Lowriders",
    "San Andreas Mercenaries",
    "Operação João e Maria",
    "Vida Super Late"
  ],

  "Esquemas": [
    "Money Fronts",
    "The Chop Shop",
    "Los Santos Drug Wars",
    "The Contract",
    "Night na Balada",
    "Acima da Lei",
    "Importação e Exportação",
    "Loucas Aventuras à Beira da Lei",
    "Motoqueiros",
    "Agents of Sabotage",
    "Bottom Dollar Bounties",
    "Tráfico de Armas"
  ],

  "Golpes": [
    "Golpe de Cayo Perico",
    "Golpe do Cassino Diamond",
    "O Golpe do Juízo Final",
    "Golpes originais"
  ],

  "Lazer": [
    "Los Santos Tuners",
    "Cassino e Resort Diamond"
  ],

  "Modos em Série": [
    "Arena de Guerra",
    "Modos Adversários",
    "Sobrevivências",
    "Corrida",
    "Mata-matas"
  ],

  "Interesses Especiais": [
    "Amante de Veículos",
    "Especialista em Armas"
  ]
};

// Plataformas GTA
const plataformas = ["PS5", "Xbox Series X/S", "PC"];

export default {
  data: new SlashCommandBuilder()
    .setName("carreira_gta")
    .setDescription("Adicionar progresso de carreira GTA Online")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Adicionar progresso de carreira")
        .addAttachmentOption(opt =>
          opt.setName("imagem").setDescription("Imagem obrigatória").setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub !== "add") return;

    const imagem = interaction.options.getAttachment("imagem");

    if (!imagem.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ O ficheiro enviado não é uma imagem válida.",
        ephemeral: true
      });
    }

    // 1) MENU DE CATEGORIA
    const categoriaMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("carreira_categoria")
        .setPlaceholder("Escolhe a categoria")
        .addOptions(
          Object.keys(categorias).map(cat => ({
            label: cat,
            value: cat
          }))
        )
    );

    await interaction.reply({
      content: "Escolhe a categoria:",
      components: [categoriaMenu],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 60000
    });

    let categoriaEscolhida = null;
    let subcategoriaEscolhida = null;
    let plataformaEscolhida = null;

    collector.on("collect", async i => {
      // CATEGORIA
      if (i.customId === "carreira_categoria") {
        categoriaEscolhida = i.values[0];

        const subMenu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("carreira_subcategoria")
            .setPlaceholder("Escolhe a subcategoria")
            .addOptions(
              categorias[categoriaEscolhida].map(sub => ({
                label: sub,
                value: sub
              }))
            )
        );

        return i.update({
          content: `Categoria escolhida: **${categoriaEscolhida}**\nAgora escolhe a subcategoria:`,
          components: [subMenu],
          ephemeral: true
        });
      }

      // SUBCATEGORIA
      if (i.customId === "carreira_subcategoria") {
        subcategoriaEscolhida = i.values[0];

        const plataformaMenu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("carreira_plataforma")
            .setPlaceholder("Escolhe a plataforma")
            .addOptions(
              plataformas.map(p => ({
                label: p,
                value: p
              }))
            )
        );

        return i.update({
          content: `Subcategoria escolhida: **${subcategoriaEscolhida}**\nAgora escolhe a plataforma:`,
          components: [plataformaMenu],
          ephemeral: true
        });
      }

      // PLATAFORMA → GUARDAR NO SISTEMA
      if (i.customId === "carreira_plataforma") {
        plataformaEscolhida = i.values[0];

        const userId = interaction.user.id;

        // 1) Guardar no MongoDB
        const updated = await UserGames.findOneAndUpdate(
          { userId },
          {
            $push: {
              carreira: {
                categoria: categoriaEscolhida,
                subcategoria: subcategoriaEscolhida,
                plataforma: plataformaEscolhida,
                jogo: "Grand Theft Auto V",
                imagem: imagem.url,
                xpGanhos: XP_CARREIRA,
                timestamp: Date.now()
              }
            }
          },
          { upsert: true, new: true }
        );

        const totalCarreira = updated.carreira.length;

        // 2) Stats individuais
        await atualizarStatsCarreira(
          userId,
          categoriaEscolhida,
          subcategoriaEscolhida,
          plataformaEscolhida
        );

        // 3) XP
        await adicionarXP(userId, XP_CARREIRA);

        // 4) Missões
        await atualizarProgresso(userId, "carreira", true);

        // 5) Stats globais
        await adicionarCategoriaCarreira(categoriaEscolhida);
        await adicionarSubcategoriaCarreira(subcategoriaEscolhida);
        await adicionarPlataformaCarreira(plataformaEscolhida);

        // 6) Badges
        await verificarBadges(userId);

        // 7) Stats atualizados
        const stats = await UserStats.findOne({ userId });

        // 8) Backup
        criarBackup();

        // 9) EMBED FINAL
        const embed = new EmbedBuilder()
          .setColor("#F5C400")
          .setTitle(`${categoriaEscolhida} — ${subcategoriaEscolhida}`)
          .setThumbnail("https://i.imgur.com/2u6hFQv.png")
          .addFields(
            { name: "🎮 Jogo", value: "Grand Theft Auto V", inline: false },
            { name: "📂 Categoria", value: categoriaEscolhida, inline: true },
            { name: "📁 Subcategoria", value: subcategoriaEscolhida, inline: true },
            { name: "🕹️ Plataforma", value: plataformaEscolhida, inline: true },
            { name: "✨ XP Ganho", value: `+${XP_CARREIRA} XP`, inline: true },
            {
              name: "📈 Nível Atual",
              value: `Nível ${stats.nivel} — ${stats.xp}/${xpNecessario(stats.nivel)} XP`,
              inline: true
            }
          )
          .setAuthor({
            name: `${interaction.user.username} completou mais um progresso de carreira no GTA Online`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setImage(imagem.url)
          .setFooter({
            text: `#${totalCarreira} progresso de carreira (por utilizador)`
          });

        await i.update({
          content: "",
          components: [],
          embeds: [embed],
          ephemeral: false
        });

        collector.stop();
      }
    });
  }
};

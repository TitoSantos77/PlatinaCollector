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

const XP_CARREIRA = 75;

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
    console.log(">>> /carreira_gta chamado");

    const sub = interaction.options.getSubcommand();
    console.log("Subcomando:", sub);

    if (sub !== "add") return;

    const imagem = interaction.options.getAttachment("imagem");
    console.log("Imagem recebida:", imagem?.url);

    if (!imagem.contentType?.startsWith("image/")) {
      console.log("Imagem inválida");
      return interaction.reply({
        content: "❌ O ficheiro enviado não é uma imagem válida.",
        ephemeral: true
      });
    }

    console.log("Criando menu de categorias...");

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

    console.log("Enviando primeira mensagem...");

    const msg = await interaction.reply({
      content: "Escolhe a categoria:",
      components: [categoriaMenu],
      ephemeral: true
    });

    console.log("Collector criado na mensagem");

    const collector = msg.createMessageComponentCollector({
      time: 60000
    });

    let categoriaEscolhida = null;
    let subcategoriaEscolhida = null;
    let plataformaEscolhida = null;

    collector.on("collect", async i => {
      console.log("Collector recebeu:", i.customId);

      if (i.customId === "carreira_categoria") {
        categoriaEscolhida = i.values[0];
        console.log("Categoria escolhida:", categoriaEscolhida);

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

      if (i.customId === "carreira_subcategoria") {
        subcategoriaEscolhida = i.values[0];
        console.log("Subcategoria escolhida:", subcategoriaEscolhida);

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

      if (i.customId === "carreira_plataforma") {
        plataformaEscolhida = i.values[0];
        console.log("Plataforma escolhida:", plataformaEscolhida);

        const userId = interaction.user.id;

        console.log("Gravando no UserGames...");

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
                data: new Date()
              }
            }
          },
          { upsert: true, new: true }
        );

        console.log("UserGames atualizado");

        const totalCarreira = updated.carreira.length;

        console.log("Atualizando stats do user...");
        await atualizarStatsCarreira(
          userId,
          categoriaEscolhida,
          subcategoriaEscolhida,
          plataformaEscolhida
        );

        console.log("Adicionando XP...");
        await adicionarXP(userId, XP_CARREIRA);

        console.log("Atualizando progresso...");
        await atualizarProgresso(userId, "carreira", true);

        console.log("Atualizando estatísticas globais...");
        await adicionarCategoriaCarreira(categoriaEscolhida);
        await adicionarSubcategoriaCarreira(subcategoriaEscolhida);
        await adicionarPlataformaCarreira(plataformaEscolhida);

        console.log("Verificando badges...");
        await verificarBadges(userId);

        const stats = await UserStats.findOne({ userId });

        console.log("Criando backup...");
        criarBackup();

        console.log("Montando embed final...");

        const embed = new EmbedBuilder()
          .setColor("#F5C400")
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

        console.log("Enviando embed final...");

        await i.update({
          content: "",
          components: [],
          embeds: [embed],
          ephemeral: false
        });

        console.log("Adicionando reação...");
        await i.message.react("🏆");

        console.log("Collector terminado");
        collector.stop();
      }
    });

    collector.on("end", () => {
      console.log("Collector terminou por timeout");
    });
  }
};

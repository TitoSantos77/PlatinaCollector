import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { XP_PROEZA, adicionarXP, xpNecessario } from "../utils/xp.js";
import { atualizarProgresso } from "../utils/missions.js";
import { adicionarJogo, adicionarPlataforma, obterJogos, obterPlataformas } from "../utils/globalStats.js";
import { atualizarStatsProeza } from "../utils/userStats.js";
import { criarBackup } from "../utils/backup.js";
import { verificarBadges } from "../utils/badges.js";
import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";

// LISTAS BASE (mantidas)
const jogosBase = [ /* ... */ ];
const plataformasBase = [ "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Nintendo Switch", "PC" ];

export const data = new SlashCommandBuilder()
  .setName("proeza")
  .setDescription("Gerir proezas")
  .addSubcommand(sub =>
    sub
      .setName("add")
      .setDescription("Adicionar uma proeza")
      .addStringOption(opt =>
        opt.setName("jogo").setDescription("Nome do jogo").setRequired(true).setAutocomplete(true)
      )
      .addStringOption(opt =>
        opt.setName("plataforma").setDescription("Plataforma usada").setRequired(true).setAutocomplete(true)
      )
      .addAttachmentOption(opt =>
        opt.setName("imagem").setDescription("Prova da proeza (screenshot)").setRequired(true)
      )
  );

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);

  if (focused.name === "jogo") {
    const aprendidos = await obterJogos();
    const lista = [...new Set([...jogosBase, ...aprendidos])]
      .filter(j => j.toLowerCase().includes(focused.value.toLowerCase()))
      .sort()
      .slice(0, 25);

    return interaction.respond(lista.map(j => ({ name: j, value: j })));
  }

  if (focused.name === "plataforma") {
    const aprendidas = await obterPlataformas();
    const lista = [...new Set([...plataformasBase, ...aprendidas])]
      .filter(p => p.toLowerCase().includes(focused.value.toLowerCase()))
      .sort()
      .slice(0, 25);

    return interaction.respond(lista.map(p => ({ name: p, value: p })));
  }
}

export async function execute(interaction) {
  const jogo = interaction.options.getString("jogo");
  const plataforma = interaction.options.getString("plataforma");
  const imagem = interaction.options.getAttachment("imagem");

  if (!imagem.contentType?.startsWith("image/")) {
    return interaction.reply({
      content: "❌ O ficheiro enviado não é uma imagem válida.",
      ephemeral: true
    });
  }

  const userId = interaction.user.id;
  const xpGanho = XP_PROEZA;

  // 1) Guardar no histórico
  const updated = await UserGames.findOneAndUpdate(
    { userId },
    {
      $push: {
        proezas: {
          jogo,
          plataforma,
          imagem: imagem.url,
          xpGanhos: xpGanho
        }
      }
    },
    { upsert: true, new: true }
  );

  const totalProezas = updated.proezas.length;

  // 2) Atualizar stats
  await atualizarStatsProeza(userId, jogo, plataforma, imagem.url);

  // 3) XP
  await adicionarXP(userId, xpGanho);

  // 4) Missões
  await atualizarProgresso(userId, "proeza", true);

  // 5) Stats globais
  await adicionarJogo(jogo);
  await adicionarPlataforma(plataforma);

  // 6) Badges
  await verificarBadges(userId);

  // 7) Stats atualizados
  const stats = await UserStats.findOne({ userId });

  // 8) Backup
  criarBackup();

  // 9) EMBED — igual ao teu, só com a frase pedida
  const embed = new EmbedBuilder()
    .setColor("#FFD000")
    .setTitle(`🏅 ${interaction.user.username} adicionou a proeza nº ${totalProezas}!`)
    .setImage(imagem.url)
    .addFields(
      { name: "👤 Jogador", value: `${interaction.user}`, inline: false },
      { name: "🎮 Jogo", value: jogo, inline: true },
      { name: "🕹️ Plataforma", value: plataforma, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true },
      {
        name: "📈 Nível Atual",
        value: `Nível ${stats.nivel} — ${stats.xp}/${xpNecessario(stats.nivel)} XP`,
        inline: true
      },
      {
        name: "🥇 Total de Proezas",
        value: `Esta foi a tua proeza nº **${totalProezas}**!`,
        inline: false
      }
    )
    .setFooter({ text: "Boa! Continua a colecionar proezas!" });

  await interaction.reply({ embeds: [embed] });
}

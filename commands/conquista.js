import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { XP_CONQUISTA, adicionarXP } from "../utils/xp.js";
import { atualizarProgresso } from "../utils/missions.js";
import { adicionarJogo, adicionarPlataforma } from "../utils/globalStats.js";
import { atualizarStatsConquista } from "../utils/userStats.js";

export const data = new SlashCommandBuilder()
  .setName("conquista")
  .setDescription("Gerir conquistas")
  .addSubcommand(sub =>
    sub
      .setName("add")
      .setDescription("Adicionar uma ou várias conquistas")
      .addIntegerOption(opt =>
        opt
          .setName("quantidade")
          .setDescription("Quantidade de conquistas")
          .setMinValue(1)
      )
      .addStringOption(opt =>
        opt
          .setName("jogo")
          .setDescription("Nome do jogo")
          .setAutocomplete(true)
      )
      .addStringOption(opt =>
        opt
          .setName("plataforma")
          .setDescription("Plataforma usada")
          .setAutocomplete(true)
      )
  );

export async function execute(interaction) {
  const quantidade = interaction.options.getInteger("quantidade") || 1;
  const jogo = interaction.options.getString("jogo");
  const plataforma = interaction.options.getString("plataforma");

  // ❌ Bloquear jogo quando quantidade > 1
  if (quantidade > 1 && jogo) {
    return interaction.reply({
      content: "❌ Não podes adicionar várias conquistas com o mesmo jogo. Remove o jogo ou define quantidade: 1.",
      ephemeral: true
    });
  }

  // XP total ganho
  const xpGanho = quantidade * XP_CONQUISTA;

  // Atualizar XP
  const user = adicionarXP(interaction.user.id, xpGanho);

  // Atualizar missões (progresso)
  atualizarProgresso(interaction.user.id, "conquista", !!jogo);

  // Atualizar globalStats e userStats (apenas quando quantidade = 1)
  if (quantidade === 1) {
    if (jogo) adicionarJogo(jogo);
    if (plataforma) adicionarPlataforma(plataforma);
    atualizarStatsConquista(interaction.user.id, jogo, plataforma);
  }

  // Criar embed
  const embed = new EmbedBuilder()
    .setColor("#FFD000")
    .setTitle(`🏅 ${quantidade} conquista${quantidade > 1 ? "s" : ""} adicionada${quantidade > 1 ? "s" : ""}!`)
    .addFields(
      { name: "🎮 Jogo", value: jogo || "Não especificado", inline: true },
      { name: "🕹️ Plataforma", value: plataforma || "Não especificado", inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true },
      { name: "📈 Nível Atual", value: `Nível ${user.nivel} — ${user.xp}/${user.totalXP} XP`, inline: true }
    )
    .setFooter({ text: "Boa! Continua a colecionar conquistas!" });

  await interaction.reply({ embeds: [embed] });
}

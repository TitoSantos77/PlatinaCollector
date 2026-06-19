import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("nivel")
  .setDescription("Mostra o teu nível e progresso de XP");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar stats do user no Mongo
  const user = await UserStats.findOne({ userId });

  if (!user) {
    return interaction.reply({
      content: "❌ Ainda não tens XP registado. Adiciona uma platina ou proeza primeiro!",
      ephemeral: true
    });
  }

  const nivel = user.nivel || 1;
  const xpAtual = user.xp || 0;
  const xpProximo = xpNecessario(nivel);

  // Percentagem
  const percent = Math.min(100, Math.floor((xpAtual / xpProximo) * 100));

  // Barra de progresso (20 blocos premium)
  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;

  const barra =
    "▰".repeat(blocosCheios) +
    "▱".repeat(blocosVazios);

  // Embed
  const embed = new EmbedBuilder()
    .setColor("#4A90E2")
    .setTitle("📈 Progresso de Nível")
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "🏅 Nível Atual", value: `${nivel}`, inline: true },
      { name: "✨ XP Atual", value: `${xpAtual} XP`, inline: true },
      { name: "🎯 XP Necessário", value: `${xpProximo} XP`, inline: true },
      { name: "📊 Progresso", value: `${percent}%`, inline: true },
      { name: "🔵 Barra de XP", value: `\`${barra}\`` }
    )
    .setFooter({ text: "Continua a evoluir, lenda!" });

  await interaction.reply({ embeds: [embed] });
}

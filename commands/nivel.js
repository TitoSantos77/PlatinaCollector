import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("nivel")
  .setDescription("Mostra o teu nível e progresso de XP");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Ler XP do user
  const users = readJSON("data/users.json");
  const user = users[userId] || { xp: 0, nivel: 1, totalXP: 0 };

  const nivel = user.nivel;
  const xpAtual = user.xp;
  const xpTotal = user.totalXP;

  // XP necessário para o próximo nível
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

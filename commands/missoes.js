import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserMissions from "../models/UserMissions.js";

export const data = new SlashCommandBuilder()
  .setName("missoes")
  .setDescription("Mostra a tua missão semanal atual");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar missões do Mongo
  const doc = await UserMissions.findOne({ userId });

  const missao = doc?.atual || null;

  // Sem missão ativa
  if (!missao) {
    return interaction.reply({
      content: "📭 **Ainda não tens missão esta semana.**\nA próxima será atribuída automaticamente.",
      ephemeral: true
    });
  }

  // Calcular progresso
  const obj = missao.objetivo;
  const prog = missao.progresso;

  const progressoTexto = [
    `🏆 Platinas: **${prog.platinas}/${obj.platinas}**`,
    `🎯 Conquistas: **${prog.conquistas}/${obj.conquistas}**`,
    `✨ XP: **${prog.xp}/${obj.xp}**`
  ]
    .filter(l => !l.includes("/0")) // remove linhas irrelevantes
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#00CC88")
    .setTitle("📘 Missão Semanal")
    .addFields(
      { name: "📝 Descrição", value: missao.descricao },
      { name: "📅 Início", value: missao.dataInicio, inline: true },
      { name: "🎁 Recompensa", value: `${missao.recompensa} XP`, inline: true },
      { name: "📊 Progresso", value: progressoTexto }
    )
    .setFooter({ text: "Boa sorte! A missão reseta automaticamente todas as semanas." });

  await interaction.reply({ embeds: [embed] });
}

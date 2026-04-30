import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("missoes")
  .setDescription("Mostra a tua missão semanal atual");

export async function execute(interaction) {
  const userId = interaction.user.id;

  const missions = readJSON("data/missions.json");
  const missao = missions[userId]?.atual || null;

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

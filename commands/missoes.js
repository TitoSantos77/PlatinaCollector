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

  // Proteção anti-NaN / valores undefined
  const prog = {
    platinas: Number(missao.progresso?.platinas) || 0,
    conquistas: Number(missao.progresso?.conquistas) || 0,
    xp: Number(missao.progresso?.xp) || 0
  };

  const obj = missao.objetivo;

  // Contador até terça-feira 00:00
  function tempoRestante() {
    const agora = new Date();
    const proximaTerca = new Date();

    // 2 = terça-feira
    proximaTerca.setDate(agora.getDate() + ((2 - agora.getDay() + 7) % 7));
    proximaTerca.setHours(0, 0, 0, 0);

    const diff = proximaTerca - agora;

    const horas = Math.floor(diff / 1000 / 60 / 60);
    const minutos = Math.floor((diff / 1000 / 60) % 60);

    return `${horas}h ${minutos}m`;
  }

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
      { name: "⏳ Tempo restante", value: tempoRestante(), inline: true },
      { name: "🎁 Recompensa", value: `${missao.recompensa} XP`, inline: true },
      { name: "📊 Progresso", value: progressoTexto }
    )
    .setFooter({ text: "Boa sorte! A missão reseta automaticamente todas as semanas." });

  await interaction.reply({ embeds: [embed] });
}

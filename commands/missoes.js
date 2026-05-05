import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserMissions from "../models/UserMissions.js";

export const data = new SlashCommandBuilder()
  .setName("missoes")
  .setDescription("Mostra a tua missão semanal atual");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar missões do Mongo
  const doc = await UserMissions.findOne({ userId });

  const missaoAtual = doc?.atual || null;
  const ultima = doc?.ultimaConcluida || null;

  // Função para calcular tempo até terça-feira 00:00
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

  // ============================
  // CASO 1 — NÃO TEM MISSÃO ATUAL MAS TEM UMA CONCLUÍDA
  // ============================
  if (!missaoAtual && ultima) {
    const embed = new EmbedBuilder()
      .setColor("#00AAFF")
      .setTitle("🏁 Missão semanal concluída!")
      .setDescription(
        `**Missão:** ${ultima.descricao || "Sem descrição"}\n` +
        `**Recompensa:** ${ultima.recompensa || 0} XP\n\n` +
        `🕒 A próxima missão será atribuída em **${tempoRestante()}**.`
      );

    return interaction.reply({ embeds: [embed] });
  }

  // ============================
  // CASO 2 — NÃO TEM MISSÃO ATUAL E NUNCA TEVE
  // ============================
  if (!missaoAtual && !ultima) {
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setTitle("📭 Sem missão ativa")
      .setDescription(
        `Ainda não tens missão esta semana.\n\n` +
        `🕒 A próxima missão será atribuída automaticamente em **${tempoRestante()}**.`
      );

    return interaction.reply({ embeds: [embed] });
  }

  // ============================
  // CASO 3 — TEM MISSÃO ATUAL (NORMAL)
  // ============================

  // Proteção anti-NaN / valores undefined
  const prog = {
    platinas: Number(missaoAtual.progresso?.platinas) || 0,
    conquistas: Number(missaoAtual.progresso?.conquistas) || 0,
    xp: Number(missaoAtual.progresso?.xp) || 0
  };

  const obj = missaoAtual.objetivo || {};

  const progressoTexto = [
    obj.platinas ? `🏆 Platinas: **${prog.platinas}/${obj.platinas}**` : null,
    obj.conquistas ? `🎯 Conquistas: **${prog.conquistas}/${obj.conquistas}**` : null,
    obj.xp ? `✨ XP: **${prog.xp}/${obj.xp}**` : null
  ]
    .filter(Boolean)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#00CC88")
    .setTitle("📘 Missão Semanal")
    .addFields(
      { name: "📝 Descrição", value: missaoAtual.descricao || "Sem descrição" },
      { name: "📅 Início", value: missaoAtual.dataInicio || "N/A", inline: true },
      { name: "⏳ Tempo restante", value: tempoRestante(), inline: true },
      { name: "🎁 Recompensa", value: `${missaoAtual.recompensa || 0} XP`, inline: true },
      { name: "📊 Progresso", value: progressoTexto || "Sem progresso registado." }
    )
    .setFooter({ text: "A missão reseta automaticamente todas as semanas." });

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserMissions from "../models/UserMissions.js";

export const data = new SlashCommandBuilder()
  .setName("missoes")
  .setDescription("Mostra a tua missão semanal atual");

export async function execute(interaction) {
  const userId = interaction.user.id;

  const doc = await UserMissions.findOne({ userId });

  const missaoAtual = doc?.atual || null;
  const ultima = doc?.ultimaConcluida || null;

  // Tempo até terça 07:00 PT
  function tempoRestante() {
    const agora = new Date();
    const agoraPT = new Date(agora.getTime() + 60 * 60 * 1000);

    const proximaTerca = new Date(agoraPT);
    proximaTerca.setDate(agoraPT.getDate() + ((2 - agoraPT.getDay() + 7) % 7));
    proximaTerca.setHours(7, 0, 0, 0);

    const diff = proximaTerca - agoraPT;

    const horas = Math.floor(diff / 1000 / 60 / 60);
    const minutos = Math.floor((diff / 1000 / 60) % 60);

    return `${horas}h ${minutos}m`;
  }

  // ============================
  // CORES POR RARIDADE
  // ============================
  const cores = {
    "Comum": "#A0A0A0",
    "Incomum": "#2ECC71",
    "Rara": "#3498DB",
    "Épica": "#9B59B6",
    "Lendária": "#F1C40F",
    "Mítica": "#E84393",
    "Exótica": "#00FFFF",
    "Premium": "#E74C3C"
  };

  // ============================
  // ÍCONES POR RARIDADE
  // ============================
  const icones = {
    "Comum": "⚪",
    "Incomum": "🟢",
    "Rara": "🔵",
    "Épica": "🟣",
    "Lendária": "🟡",
    "Mítica": "💠",
    "Exótica": "🌀",
    "Premium": "🔥"
  };

  // ============================
  // CASO 1 — MISSÃO CONCLUÍDA
  // ============================
  if (!missaoAtual && ultima) {
    const raridade = ultima.raridade || "Comum";
    const categoria = ultima.categoria || "N/A";

    const embed = new EmbedBuilder()
      .setColor(cores[raridade] || "#00AAFF")
      .setTitle(`${icones[raridade]} ${raridade} — Missão Concluída`)
      .addFields(
        { name: "📝 Descrição", value: ultima.descricao || "Sem descrição" },
        { name: "🏷️ Categoria", value: categoria, inline: true },
        { name: "📅 Início", value: ultima.dataInicio || "N/A", inline: true },
        { name: "📅 Fim", value: ultima.dataFim || "N/A", inline: true },
        { name: "🎁 Recompensa", value: `${ultima.recompensa || 0} XP`, inline: true }
      )
      .setDescription(
        `🕒 A próxima missão será atribuída em **${tempoRestante()}**.`
      );

    return interaction.reply({ embeds: [embed] });
  }

  // ============================
  // CASO 2 — NUNCA TEVE MISSÃO
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
  // CASO 3 — MISSÃO ATUAL
  // ============================

  const raridade = missaoAtual.raridade || "Comum";
  const categoria = missaoAtual.categoria || "N/A";

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
    .setColor(cores[raridade] || "#00CC88")
    .setTitle(`${icones[raridade]} ${raridade} — Missão Semanal`)
    .addFields(
      { name: "📝 Descrição", value: missaoAtual.descricao || "Sem descrição" },
      { name: "🏷️ Categoria", value: categoria, inline: true },
      { name: "📅 Início", value: missaoAtual.dataInicio || "N/A", inline: true },
      { name: "⏳ Tempo restante", value: tempoRestante(), inline: true },
      { name: "🎁 Recompensa", value: `${missaoAtual.recompensa || 0} XP`, inline: true },
      { name: "📊 Progresso", value: progressoTexto || "Sem progresso registado." }
    )
    .setFooter({ text: "A missão reseta automaticamente todas as semanas." });

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fix_stats")
    .setDescription("Corrigir dados corrompidos do UserStats (seguro)"),

  async execute(interaction) {
    await interaction.reply({
      content: "🔧 A corrigir dados…",
      ephemeral: true
    });

    const userId = interaction.user.id;
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      return interaction.editReply("❌ Não encontrei UserStats para ti.");
    }

    let alteracoes = [];

    // -----------------------------
    // FIX: XP e totalXP
    // -----------------------------
    if (isNaN(stats.xp)) {
      stats.xp = 0;
      alteracoes.push("XP corrigido (NaN → 0)");
    }

    if (isNaN(stats.totalXP)) {
      stats.totalXP = 0;
      alteracoes.push("totalXP corrigido (NaN → 0)");
    }

    // -----------------------------
    // FIX: nível
    // -----------------------------
    if (isNaN(stats.nivel) || stats.nivel < 1) {
      stats.nivel = 1;
      alteracoes.push("Nível corrigido (inválido → 1)");
    }

    // -----------------------------
    // FIX: categoriasCarreira
    // -----------------------------
    if (!Array.isArray(stats.categoriasCarreira)) {
      stats.categoriasCarreira = [];
      alteracoes.push("categoriasCarreira convertido para array");
    }

    // -----------------------------
    // FIX: subcategoriasCarreira
    // -----------------------------
    if (!Array.isArray(stats.subcategoriasCarreira)) {
      stats.subcategoriasCarreira = [];
      alteracoes.push("subcategoriasCarreira convertido para array");
    }

    // -----------------------------
    // FIX: plataformasCarreira
    // -----------------------------
    if (!Array.isArray(stats.plataformasCarreira)) {
      stats.plataformasCarreira = [];
      alteracoes.push("plataformasCarreira convertido para array");
    }

    // -----------------------------
    // FIX: badges
    // -----------------------------
    if (!Array.isArray(stats.badgesDesbloqueadas)) {
      stats.badgesDesbloqueadas = [];
      alteracoes.push("badgesDesbloqueadas convertido para array");
    }

    await stats.save();

    if (alteracoes.length === 0) {
      return interaction.editReply("✔ Tudo OK. Nada para corrigir.");
    }

    return interaction.editReply(
      "🔧 Correções aplicadas:\n- " + alteracoes.join("\n- ")
    );
  }
};

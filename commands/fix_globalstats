import { SlashCommandBuilder } from "discord.js";
import GlobalStats from "../models/GlobalStats.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fix_globalstats")
    .setDescription("Corrigir dados corrompidos do GlobalStats (seguro)"),

  async execute(interaction) {
    await interaction.reply({
      content: "🔧 A corrigir dados globais…",
      ephemeral: true
    });

    const stats = await GlobalStats.findOne();
    if (!stats) {
      return interaction.editReply("❌ GlobalStats não encontrado.");
    }

    let alteracoes = [];

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

    await stats.save();

    if (alteracoes.length === 0) {
      return interaction.editReply("✔ Tudo OK. Nada para corrigir.");
    }

    return interaction.editReply(
      "🔧 Correções aplicadas:\n- " + alteracoes.join("\n- ")
    );
  }
};

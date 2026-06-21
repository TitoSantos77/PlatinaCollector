import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserGames from "../models/UserGames.js";
import UserStats from "../models/UserStats.js";
import { adicionarXP, XP_CONQUISTA } from "../utils/xp.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fixproezas")
    .setDescription("Corrige proezas antigas vindas da migração (ADMIN).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply("🔧 A corrigir proezas antigas...");

    const users = await UserGames.find();

    let corrigidas = 0;
    let removidas = 0;

    for (const user of users) {
      let alterou = false;

      const novasProezas = [];

      for (const p of user.proezas) {
        // Ignorar entradas completamente inválidas
        if (!p || typeof p !== "object") {
          removidas++;
          continue;
        }

        // Criar nova estrutura válida
        const nova = {
          jogo: p.jogo || p.nome || "Conquista Antiga",
          plataforma: p.plataforma || "Desconhecida",
          imagem: p.imagem || "https://i.imgur.com/placeholder.png",
          xpGanhos: typeof p.xpGanhos === "number" ? p.xpGanhos : XP_CONQUISTA,
          data: p.data || new Date().toISOString().split("T")[0]
        };

        novasProezas.push(nova);
        corrigidas++;
        alterou = true;
      }

      if (alterou) {
        user.proezas = novasProezas;
        await user.save();
      }
    }

    // Recalcular XP e nível para todos os users
    const statsUsers = await UserStats.find();

    for (const stats of statsUsers) {
      const games = await UserGames.findOne({ userId: stats.userId });
      if (!games) continue;

      // Reset XP
      stats.xp = 0;
      stats.totalXP = 0;
      stats.nivel = 1;
      await stats.save();

      // Reaplicar XP das proezas
      for (const p of games.proezas) {
        await adicionarXP(stats.userId, p.xpGanhos);
      }

      // Reaplicar XP das platinas
      for (const pl of games.platinas) {
        await adicionarXP(stats.userId, 100);
      }
    }

    return interaction.followUp(
      `✅ Proezas corrigidas!\n\n` +
      `🔧 Proezas reconstruídas: **${corrigidas}**\n` +
      `🗑️ Proezas removidas: **${removidas}**\n` +
      `📈 XP e níveis recalculados para todos os users.`
    );
  }
};

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserGames from "../models/UserGames.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rebuildstats")
    .setDescription("Reconstrói UserStats com base no UserGames (ADMIN).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply("🔧 A reconstruir UserStats...");

    const usersGames = await UserGames.find({}, "userId platinas proezas conquistas");

    let criados = 0;
    let atualizados = 0;

    for (const u of usersGames) {
      const totalPlatinas = u.platinas?.length || 0;
      const totalProezas = u.proezas?.length || 0;
      const totalConquistas = u.conquistas?.length || 0;

      let stats = await UserStats.findOne({ userId: u.userId });

      if (!stats) {
        await UserStats.create({
          userId: u.userId,
          platinas: totalPlatinas,
          conquistas: totalProezas + totalConquistas,
          xp: 0,
          totalXP: 0,
          nivel: 1,
          badge: "⚪ Iniciante",
          badgesDesbloqueadas: ["⚪ Iniciante"]
        });
        criados++;
      } else {
        stats.platinas = totalPlatinas;
        stats.conquistas = totalProezas + totalConquistas;
        await stats.save();
        atualizados++;
      }
    }

    return interaction.followUp(
      `✅ UserStats reconstruído!\n\n` +
      `🆕 Criados: **${criados}**\n` +
      `🔄 Atualizados: **${atualizados}**\n` +
      `👥 Total de jogadores: **${usersGames.length}**`
    );
  }
};

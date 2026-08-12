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

    const usersGames = await UserGames.find({}, "userId platinas proezas conquistas carreira");

    let criados = 0;
    let atualizados = 0;

    for (const u of usersGames) {
      const totalPlatinas = u.platinas?.length || 0;
      const totalProezas = (u.proezas?.length || 0) + (u.conquistas?.length || 0);
      const totalCarreira = u.carreira?.length || 0;

      const ultimaPlatina = totalPlatinas > 0 ? u.platinas.at(-1) : null;
      const ultimaCarreira = totalCarreira > 0 ? u.carreira.at(-1) : null;

      let stats = await UserStats.findOne({ userId: u.userId });

      if (!stats) {
        await UserStats.create({
          userId: u.userId,
          totalPlatinas,
          totalProezas,
          totalCarreira,
          ultimaPlatina,
          ultimaCarreira,
          xp: 0,
          totalXP: 0,
          nivel: 1
        });
        criados++;
      } else {
        stats.totalPlatinas = totalPlatinas;
        stats.totalProezas = totalProezas;
        stats.totalCarreira = totalCarreira;
        stats.ultimaPlatina = ultimaPlatina;
        stats.ultimaCarreira = ultimaCarreira;
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

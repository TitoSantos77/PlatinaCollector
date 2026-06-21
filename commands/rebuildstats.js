import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserGames from "../models/UserGames.js";
import UserMissions from "../models/UserMissions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rebuildstats")
    .setDescription("Recria UserStats para todos os jogadores (ADMIN).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply("🔧 A reconstruir UserStats...");

    const usersGames = await UserGames.find({}, "userId");
    const usersMissions = await UserMissions.find({}, "userId");

    // juntar todos os userIds únicos
    const userIds = new Set();

    for (const u of usersGames) userIds.add(u.userId);
    for (const u of usersMissions) userIds.add(u.userId);

    let criados = 0;
    let existentes = 0;

    for (const userId of userIds) {
      let stats = await UserStats.findOne({ userId });

      if (!stats) {
        // contar platinas e proezas
        const games = await UserGames.findOne({ userId });

        const totalPlatinas = games?.games?.filter(g => g.platina === true).length || 0;
        const totalProezas = games?.games?.reduce((acc, g) => acc + (g.proezas || 0), 0) || 0;

        await UserStats.create({
          userId,
          xp: 0,
          totalXP: 0,
          nivel: 1,
          totalPlatinas,
          totalProezas
        });

        criados++;
      } else {
        existentes++;
      }
    }

    return interaction.followUp(
      `✅ **UserStats reconstruído!**\n\n` +
      `🆕 Criados: **${criados}**\n` +
      `📌 Já existiam: **${existentes}**\n` +
      `👥 Total de jogadores detetados: **${userIds.size}**`
    );
  }
};

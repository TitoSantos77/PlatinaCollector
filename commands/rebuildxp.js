import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserMissions from "../models/UserMissions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rebuildxp")
    .setDescription("Reconstrói o XP de um utilizador (ADMIN).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // <-- SÓ ADMINS
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Utilizador a reconstruir XP")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const stats = await UserStats.findOne({ userId: user.id });
    const missions = await UserMissions.findOne({ userId: user.id });

    if (!stats) {
      return interaction.reply({ content: "❌ Esse utilizador não tem perfil.", ephemeral: true });
    }

    // XP por platinas e proezas
    const xpPlatinas = stats.totalPlatinas * 100;
    const xpProezas = stats.totalProezas * 50;

    // XP por missões concluídas
    let xpMissoes = 0;

    if (missions && missions.historico) {
      for (const m of missions.historico) {
        xpMissoes += Number(m.recompensa) || 0;
      }
    }

    const totalXP = xpPlatinas + xpProezas + xpMissoes;
    const nivel = Math.floor(totalXP / 100) + 1;
    const xpAtual = totalXP % 100;

    await UserStats.findOneAndUpdate(
      { userId: user.id },
      {
        xp: xpAtual,
        totalXP: totalXP,
        nivel: nivel
      }
    );

    return interaction.reply(
      `🔧 XP reconstruído para **${user.username}**!\n\n` +
      `🏆 XP por Platinas: **${xpPlatinas}**\n` +
      `🔥 XP por Proezas: **${xpProezas}**\n` +
      `🧩 XP por Missões: **${xpMissoes}**\n\n` +
      `📊 XP Total: **${totalXP}**\n` +
      `⭐ Nível: **${nivel}**\n` +
      `📈 XP Atual: **${xpAtual}/100**`
    );
  }
};

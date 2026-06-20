import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserMissions from "../models/UserMissions.js";

async function calcularXP(userId) {
  const stats = await UserStats.findOne({ userId });
  const missions = await UserMissions.findOne({ userId });

  if (!stats) return null;

  const xpPlatinas = stats.totalPlatinas * 100;
  const xpProezas = stats.totalProezas * 50;

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
    { userId },
    { xp: xpAtual, totalXP, nivel }
  );

  return { totalXP, nivel, xpAtual, xpPlatinas, xpProezas, xpMissoes };
}

export default {
  data: new SlashCommandBuilder()
    .setName("rebuildxp")
    .setDescription("Reconstrói XP de um utilizador ou de todos (ADMIN).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("modo")
        .setDescription("Escolhe 'user' ou 'all'")
        .setRequired(true)
        .addChoices(
          { name: "User", value: "user" },
          { name: "Todos", value: "all" }
        )
    )
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Utilizador (apenas se modo = user)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const modo = interaction.options.getString("modo");
    const user = interaction.options.getUser("user");

    if (modo === "user") {
      if (!user) {
        return interaction.reply({ content: "❌ Tens de escolher um user.", ephemeral: true });
      }

      const result = await calcularXP(user.id);
      if (!result) {
        return interaction.reply({ content: "❌ Esse user não tem perfil.", ephemeral: true });
      }

      return interaction.reply(
        `🔧 XP reconstruído para **${user.username}**!\n\n` +
        `🏆 Platinas XP: **${result.xpPlatinas}**\n` +
        `🔥 Proezas XP: **${result.xpProezas}**\n` +
        `🧩 Missões XP: **${result.xpMissoes}**\n\n` +
        `📊 Total XP: **${result.totalXP}**\n` +
        `⭐ Nível: **${result.nivel}**\n` +
        `📈 XP Atual: **${result.xpAtual}/100**`
      );
    }

    // ============================
    // MODO ALL
    // ============================
    const users = await UserStats.find({}, "userId");

    let count = 0;
    for (const u of users) {
      await calcularXP(u.userId);
      count++;
    }

    return interaction.reply(
      `🔧 XP reconstruído para **TODOS OS USERS**!\n` +
      `📌 Total processados: **${count}**`
    );
  }
};

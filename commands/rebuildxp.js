import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserStats from "../models/UserStats.js";
import UserGames from "../models/UserGames.js";
import UserMissions from "../models/UserMissions.js";
import { adicionarXP, XP_PLATINA, XP_CONQUISTA } from "../utils/xpSystem.js";

async function calcularXP(userId) {
  const stats = await UserStats.findOne({ userId });
  const games = await UserGames.findOne({ userId });
  const missions = await UserMissions.findOne({ userId });

  if (!stats || !games) return null;

  let totalXP = 0;

  // XP por platinas
  totalXP += (games.platinas?.length || 0) * XP_PLATINA;

  // XP por proezas + conquistas
  const totalConquistas = (games.proezas?.length || 0) + (games.conquistas?.length || 0);
  totalXP += totalConquistas * XP_CONQUISTA;

  // XP por missões
  if (missions && Array.isArray(missions.historico)) {
    for (const m of missions.historico) {
      if (!m) continue;
      if (typeof m.recompensa !== "number") continue;
      totalXP += m.recompensa;
    }
  }

  // Reset XP e aplicar XP real via sistema original
  stats.xp = 0;
  stats.totalXP = 0;
  stats.nivel = 1;
  await stats.save();

  await adicionarXP(userId, totalXP);

  return totalXP;
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
        return interaction.reply({ content: "Tens de escolher um user.", ephemeral: true });
      }

      const totalXP = await calcularXP(user.id);
      if (totalXP === null) {
        return interaction.reply({ content: "Esse user não tem perfil.", ephemeral: true });
      }

      return interaction.reply(
        `XP reconstruído para **${user.username}**!\n` +
        `Total XP aplicado: **${totalXP}**`
      );
    }

    // MODO ALL
    const users = await UserStats.find({}, "userId");

    let count = 0;
    for (const u of users) {
      await calcularXP(u.userId);
      count++;
    }

    return interaction.reply(
      `XP reconstruído para **TODOS OS USERS**!\n` +
      `Total processados: **${count}**`
    );
  }
};

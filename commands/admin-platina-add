import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { XP_PLATINA, adicionarXP } from "../utils/xp.js";
import { readJSON, writeJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("admin-platina-add")
  .setDescription("Admin: adicionar várias platinas a um utilizador")
  .addUserOption(opt =>
    opt
      .setName("utilizador")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt
      .setName("quantidade")
      .setDescription("Quantidade de platinas a adicionar")
      .setRequired(true)
      .setMinValue(1)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const target = interaction.options.getUser("utilizador");
  const quantidade = interaction.options.getInteger("quantidade");

  const stats = readJSON("data/userStats.json");

  if (!stats[target.id]) {
    stats[target.id] = {
      platinas: 0,
      ultimaPlatina: null,
      ultimaPlatinaImagem: null,
      ultimaPlatinaTimestamp: null
    };
  }

  // XP total
  const xpGanho = quantidade * XP_PLATINA;

  // Adicionar XP
  adicionarXP(target.id, xpGanho);

  // Adicionar platinas
  stats[target.id].platinas += quantidade;

  // Admin não define última platina
  stats[target.id].ultimaPlatina = null;
  stats[target.id].ultimaPlatinaImagem = null;
  stats[target.id].ultimaPlatinaTimestamp = null;

  writeJSON("data/userStats.json", stats);

  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🛠️ Platinas adicionadas (Admin)")
    .addFields(
      { name: "👤 Utilizador", value: `${target}`, inline: true },
      { name: "🏆 Platinas adicionadas", value: `${quantidade}`, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true }
    )
    .setFooter({ text: "Admin: operação concluída com sucesso." });

  await interaction.reply({ embeds: [embed] });
}

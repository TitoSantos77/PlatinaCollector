import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { XP_PROEZA, adicionarXP } from "../utils/xp.js";
import { readJSON, writeJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("admin-proeza-add")
  .setDescription("Admin: adicionar várias proezas a um utilizador")
  .addUserOption(opt =>
    opt
      .setName("utilizador")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt
      .setName("quantidade")
      .setDescription("Quantidade de proezas a adicionar")
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
      proezas: 0,
      ultimaProeza: null,
      ultimaProezaImagem: null,
      ultimaProezaTimestamp: null
    };
  }

  // XP total
  const xpGanho = quantidade * XP_PROEZA;

  // Adicionar XP
  adicionarXP(target.id, xpGanho);

  // Adicionar proezas
  stats[target.id].proezas += quantidade;

  // Admin não define última proeza
  stats[target.id].ultimaProeza = null;
  stats[target.id].ultimaProezaImagem = null;
  stats[target.id].ultimaProezaTimestamp = null;

  writeJSON("data/userStats.json", stats);

  const embed = new EmbedBuilder()
    .setColor("#FFD000")
    .setTitle("🛠️ Proezas adicionadas (Admin)")
    .addFields(
      { name: "👤 Utilizador", value: `${target}`, inline: true },
      { name: "🏅 Proezas adicionadas", value: `${quantidade}`, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true }
    )
    .setFooter({ text: "Admin: operação concluída com sucesso." });

  await interaction.reply({ embeds: [embed] });
}

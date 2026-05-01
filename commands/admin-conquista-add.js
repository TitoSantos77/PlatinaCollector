import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { XP_CONQUISTA, adicionarXP } from "../utils/xp.js";
import { readJSON, writeJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("admin-conquista-add")
  .setDescription("Admin: adicionar várias conquistas a um utilizador")
  .addUserOption(opt =>
    opt
      .setName("utilizador")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt
      .setName("quantidade")
      .setDescription("Quantidade de conquistas a adicionar")
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
      conquistas: 0,
      ultimaConquista: null,
      ultimaConquistaImagem: null,
      ultimaConquistaTimestamp: null
    };
  }

  // XP total
  const xpGanho = quantidade * XP_CONQUISTA;

  // Adicionar XP
  adicionarXP(target.id, xpGanho);

  // Adicionar conquistas
  stats[target.id].conquistas += quantidade;

  // Admin não define última conquista
  stats[target.id].ultimaConquista = null;
  stats[target.id].ultimaConquistaImagem = null;
  stats[target.id].ultimaConquistaTimestamp = null;

  writeJSON("data/userStats.json", stats);

  const embed = new EmbedBuilder()
    .setColor("#FFD000")
    .setTitle("🛠️ Conquistas adicionadas (Admin)")
    .addFields(
      { name: "👤 Utilizador", value: `${target}`, inline: true },
      { name: "🏅 Conquistas adicionadas", value: `${quantidade}`, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true }
    )
    .setFooter({ text: "Admin: operação concluída com sucesso." });

  await interaction.reply({ embeds: [embed] });
}

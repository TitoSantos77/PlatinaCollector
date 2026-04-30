import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";

export const data = new SlashCommandBuilder()
  .setName("rank")
  .setDescription("Mostra a tua posição no ranking")
  .addStringOption(opt =>
    opt
      .setName("tipo")
      .setDescription("Tipo de ranking")
      .setRequired(true)
      .addChoices(
        { name: "Geral", value: "geral" },
        { name: "Semanal", value: "semanal" },
        { name: "Mensal", value: "mensal" }
      )
  );

export async function execute(interaction) {
  const tipo = interaction.options.getString("tipo");
  const userId = interaction.user.id;

  // Carregar XP total dos users
  const users = readJSON("data/users.json");

  // Converter users em array
  const lista = Object.entries(users).map(([id, dados]) => ({
    id,
    xp: dados.totalXP || 0
  }));

  // Ordenar por XP total
  lista.sort((a, b) => b.xp - a.xp);

  // Encontrar posição do user
  const posicao = lista.findIndex(u => u.id === userId) + 1;
  const total = lista.length;
  const xpUser = lista.find(u => u.id === userId)?.xp || 0;

  const embed = new EmbedBuilder()
    .setColor("#00FFAA")
    .setTitle("📊 Ranking")
    .addFields(
      { name: "Tipo", value: tipo.charAt(0).toUpperCase() + tipo.slice(1), inline: true },
      { name: "Posição", value: `#${posicao}`, inline: true },
      { name: "XP Total", value: `${xpUser} XP`, inline: true },
      { name: "Total de Jogadores", value: `${total}`, inline: true }
    )
    .setFooter({ text: "Continua a subir no ranking!" });

  await interaction.reply({ embeds: [embed] });
}

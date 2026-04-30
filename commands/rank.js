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

  const stats = readJSON("data/userStats.json");

  // Converter stats em array
  const lista = Object.entries(stats).map(([id, dados]) => ({
    id,
    pontos: dados.platinas + dados.conquistas
  }));

  // Ordenar por pontos
  lista.sort((a, b) => b.pontos - a.pontos);

  // Encontrar posição do user
  const posicao = lista.findIndex(u => u.id === userId) + 1;
  const total = lista.length;

  const embed = new EmbedBuilder()
    .setColor("#00FFAA")
    .setTitle("📊 Ranking")
    .addFields(
      { name: "Tipo", value: tipo.charAt(0).toUpperCase() + tipo.slice(1), inline: true },
      { name: "Posição", value: `#${posicao}`, inline: true },
      { name: "Total de Jogadores", value: `${total}`, inline: true }
    )
    .setFooter({ text: "Continua a subir no ranking!" });

  await interaction.reply({ embeds: [embed] });
}

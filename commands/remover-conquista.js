import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { XP_CONQUISTA, adicionarXP } from "../utils/xp.js";
import { readJSON, writeJSON } from "../utils/database.js";
import { removerJogo, removerPlataforma } from "../utils/globalStats.js";

// 🔵 IMPORTAR BACKUP
import { criarBackup } from "../utils/backup.js";

export const data = new SlashCommandBuilder()
  .setName("remover-conquista")
  .setDescription("Remove a última conquista de um utilizador")
  .addUserOption(opt =>
    opt
      .setName("utilizador")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const target = interaction.options.getUser("utilizador");
  const stats = readJSON("data/userStats.json");

  if (!stats[target.id] || stats[target.id].conquistas <= 0) {
    return interaction.reply({
      content: "❌ Esse utilizador não tem conquistas para remover.",
      ephemeral: true
    });
  }

  const ultima = stats[target.id].ultimaConquista;

  // Remover XP
  adicionarXP(target.id, -XP_CONQUISTA);

  // Remover stats do user
  stats[target.id].conquistas--;
  stats[target.id].ultimaConquista = null;
  stats[target.id].ultimaConquistaImagem = null;
  stats[target.id].ultimaConquistaTimestamp = null;

  writeJSON("data/userStats.json", stats);

  // Remover globalStats (-1)
  if (ultima?.jogo) removerJogo(ultima.jogo);
  if (ultima?.plataforma) removerPlataforma(ultima.plataforma);

  // 🔵 CRIAR BACKUP DEPOIS DE TODAS AS ALTERAÇÕES
  criarBackup();

  const embed = new EmbedBuilder()
    .setColor("#FFAA00")
    .setTitle("❌ Conquista removida")
    .addFields(
      { name: "👤 Utilizador", value: `${target}`, inline: true },
      { name: "🎮 Jogo", value: ultima?.jogo || "Desconhecido", inline: true },
      { name: "🕹️ Plataforma", value: ultima?.plataforma || "Desconhecida", inline: true },
      { name: "📉 XP Removido", value: `-${XP_CONQUISTA} XP`, inline: true }
    )
    .setFooter({ text: "A última conquista foi removida com sucesso." });

  await interaction.reply({ embeds: [embed] });
}

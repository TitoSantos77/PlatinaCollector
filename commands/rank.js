import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { readJSON } from "../utils/database.js";
import { xpNecessario } from "../utils/xp.js";

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
    xp: dados.totalXP || 0,
    nivel: dados.nivel || 1,
    xpAtual: dados.xp || 0
  }));

  // Ordenar por XP total
  lista.sort((a, b) => b.xp - a.xp);

  // Encontrar posição do user
  const posicao = lista.findIndex(u => u.id === userId) + 1;
  const total = lista.length;
  const userData = lista.find(u => u.id === userId);

  const xpUser = userData?.xp || 0;
  const nivelUser = userData?.nivel || 1;
  const xpAtual = userData?.xpAtual || 0;
  const xpProximo = xpNecessario(nivelUser);

  // Barra de XP (20 blocos)
  const percent = Math.min(100, Math.floor((xpAtual / xpProximo) * 100));
  const totalBlocos = 20;
  const blocosCheios = Math.round((percent / 100) * totalBlocos);
  const blocosVazios = totalBlocos - blocosCheios;
  const barra = "▰".repeat(blocosCheios) + "▱".repeat(blocosVazios);

  // Mini ranking (3 acima e 3 abaixo)
  const index = posicao - 1;
  const inicio = Math.max(0, index - 3);
  const fim = Math.min(lista.length, index + 4);

  const miniRanking = lista.slice(inicio, fim).map((u, i) => {
    const pos = inicio + i + 1;
    const marcador = u.id === userId ? "👉 **TU**" : "";
    return `**#${pos}** — <@${u.id}> — ${u.xp} XP ${marcador}`;
  }).join("\n");

  const embed = new EmbedBuilder()
    .setColor("#00FFAA")
    .setAuthor({
      name: `${interaction.user.username} — Ranking ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .addFields(
      { name: "📌 Posição", value: `#${posicao} de ${total}`, inline: true },
      { name: "🏅 Nível", value: `${nivelUser}`, inline: true },
      { name: "⭐ XP Total", value: `${xpUser} XP`, inline: true },

      { name: "📊 Progresso para o próximo nível", value: `${percent}%`, inline: true },
      { name: "🔵 Barra de XP", value: `\`${barra}\`` },

      { name: "📈 Mini Ranking", value: miniRanking }
    )
    .setFooter({ text: "Continua a subir no ranking!" });

  await interaction.reply({ embeds: [embed] });
}

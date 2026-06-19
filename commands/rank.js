import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("rank")
  .setDescription("Mostra a tua posição no ranking XP geral");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar users do Mongo
  const users = await UserStats.find().lean();

  // Converter users em array
  const lista = users.map(u => ({
    id: u.userId,
    xp: u.totalXP || 0,
    nivel: u.nivel || 1,
    xpAtual: u.xp || 0
  }));

  // Ordenar por XP total
  lista.sort((a, b) => b.xp - a.xp);

  // Encontrar posição do user
  const posicao = lista.findIndex(u => u.id === userId) + 1;
  const total = lista.length;
  const userData = lista.find(u => u.id === userId);

  const nivelUser = userData?.nivel || 1;
  const xpAtual = userData?.xpAtual || 0;
  const xpProximo = xpNecessario(nivelUser);

  // Barra de XP
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
    .setColor("#00A3FF")
    .setTitle("📊 A tua posição no ranking XP")
    .setDescription(
      `**Posição:** #${posicao}/${total}\n` +
      `**Nível:** ${nivelUser}\n` +
      `**XP:** ${xpAtual}/${xpProximo}\n\n` +
      `${barra}\n\n` +
      `**Mini Ranking:**\n${miniRanking}`
    );

  await interaction.reply({ embeds: [embed] });
}

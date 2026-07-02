import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import GlobalStats from "../models/GlobalStats.js";

export const data = new SlashCommandBuilder()
  .setName("estatisticas")
  .setDescription("Mostra estatísticas gerais do servidor");

export async function execute(interaction) {

  // LOG 1 — confirmar que este ficheiro está a ser carregado
  console.log(">>> [ESTATISTICAS] FICHEIRO ATIVO <<<");

  const stats = await UserStats.find().lean();
  const globalStats = await GlobalStats.findOne().lean();

  // LOG 2 — ver o documento global REAL vindo do Mongo
  console.log(">>> [ESTATISTICAS] GLOBALSTATS RAW:", globalStats);

  // LOG 3 — ver se os arrays existem e o que têm
  if (globalStats) {
    console.log(">>> jogos:", globalStats.jogos);
    console.log(">>> plataformas:", globalStats.plataformas);
    console.log(">>> categoriasCarreira:", globalStats.categoriasCarreira);
    console.log(">>> subcategoriasCarreira:", globalStats.subcategoriasCarreira);
    console.log(">>> plataformasGTA:", globalStats.plataformasGTA);
  } else {
    console.log(">>> [ESTATISTICAS] GlobalStats veio NULL");
  }

  const totalJogadores = stats.length;
  const totalXP = stats.reduce((acc, u) => acc + (u.totalXP || 0), 0);
  const totalPlatinas = stats.reduce((acc, u) => acc + (u.totalPlatinas || 0), 0);
  const totalCarreira = stats.reduce((acc, u) => acc + (u.totalCarreira || 0), 0);

  // Função para contar ocorrências
  function contar(array) {
    const mapa = {};
    for (const item of array || []) {
      mapa[item] = (mapa[item] || 0) + 1;
    }
    return mapa;
  }

  // Jogo mais platinado
  let jogoMaisFeito = "Nenhum";
  if (globalStats?.jogos?.length > 0) {
    const contagem = contar(globalStats.jogos);
    jogoMaisFeito = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Plataforma mais usada (platinas)
  let plataformaMaisUsada = "Nenhuma";
  if (globalStats?.plataformas?.length > 0) {
    const contagem = contar(globalStats.plataformas);
    plataformaMaisUsada = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Categoria mais feita (carreira)
  let categoriaMaisFeita = "Nenhuma";
  if (globalStats?.categoriasCarreira?.length > 0) {
    const contagem = contar(globalStats.categoriasCarreira);
    categoriaMaisFeita = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Subcategoria mais feita (carreira)
  let subcategoriaMaisFeita = "Nenhuma";
  if (globalStats?.subcategoriasCarreira?.length > 0) {
    const contagem = contar(globalStats.subcategoriasCarreira);
    subcategoriaMaisFeita = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Plataforma GTA mais usada
  let plataformaCarreiraMaisUsada = "Nenhuma";
  if (globalStats?.plataformasGTA?.length > 0) {
    const contagem = contar(globalStats.plataformasGTA);
    plataformaCarreiraMaisUsada = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Top XP
  let topXP = "Nenhum";
  if (stats.length > 0) {
    const sortedXP = [...stats].sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));
    topXP = `<@${sortedXP[0].userId}> (${sortedXP[0].totalXP} XP)`;
  }

  // Top Platinas
  let topPlatinas = "Nenhum";
  if (stats.length > 0) {
    const sortedPlatinas = [...stats].sort((a, b) => (b.totalPlatinas || 0) - (a.totalPlatinas || 0));
    topPlatinas = `<@${sortedPlatinas[0].userId}> (${sortedPlatinas[0].totalPlatinas} platinas)`;
  }

  // Top Carreira
  let topCarreira = "Nenhum";
  if (stats.length > 0) {
    const sortedCarreira = [...stats].sort((a, b) => (b.totalCarreira || 0) - (a.totalCarreira || 0));
    topCarreira = `<@${sortedCarreira[0].userId}> (${sortedCarreira[0].totalCarreira} ações de carreira)`;
  }

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("📊 Estatísticas Gerais do Servidor")
    .addFields(
      { name: "👥 Jogadores Registados", value: `${totalJogadores}`, inline: true },
      { name: "⭐ XP Total", value: `${totalXP} XP`, inline: true },
      { name: "🏆 Platinas Totais", value: `${totalPlatinas}`, inline: true },
      { name: "🚗 Ações de Carreira GTA", value: `${totalCarreira}`, inline: true },
      { name: "🔥 Jogo Mais Platinado", value: jogoMaisFeito, inline: true },
      { name: "💿 Plataforma Mais Usada", value: plataformaMaisUsada, inline: true },
      { name: "🏎 Categoria Mais Feita (Carreira)", value: categoriaMaisFeita, inline: true },
      { name: "🎯 Subcategoria Mais Feita", value: subcategoriaMaisFeita, inline: true },
      { name: "🎮 Plataforma GTA Mais Usada", value: plataformaCarreiraMaisUsada, inline: true },
      { name: "👑 User com Mais XP", value: topXP, inline: false },
      { name: "🏅 User com Mais Platinas", value: topPlatinas, inline: false },
      { name: "🚗 User com Mais Carreira GTA", value: topCarreira, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

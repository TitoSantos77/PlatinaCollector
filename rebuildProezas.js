import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

async function rebuildProezas() {
  console.log("🔧 A reconstruir PROEZAS...");

  const users = await UserGames.find({});

  for (const user of users) {
    const conquistas = user.conquistas || [];

    // Se não tiver conquistas, ignora
    if (conquistas.length === 0) continue;

    // Converter conquistas → proezas
    const novasProezas = conquistas.map(c => ({
      jogo: c.nome || c.jogo || null,
      plataforma: c.plataforma || null,
      imagem: c.imagem || null,
      data: c.data || null,
      xpGanhos: c.xpGanhos || 0
    }));

    // Adicionar às proezas existentes
    user.proezas = [...user.proezas, ...novasProezas];

    // Limpar conquistas antigas
    user.conquistas = [];

    await user.save();

    // Atualizar UserStats
    let stats = await UserStats.findOne({ userId: user.userId });

    if (!stats) {
      stats = await UserStats.create({
        userId: user.userId,
        totalPlatinas: 0,
        totalProezas: 0,
        xp: 0,
        totalXP: 0,
        nivel: 1,
        badgesDesbloqueadas: []
      });
    }

    stats.totalProezas = user.proezas.length;
    stats.ultimaProeza = user.proezas[user.proezas.length - 1] || null;

    await stats.save();

    console.log(`➡️ User ${user.userId}: ${novasProezas.length} proezas convertidas`);
  }

  console.log("✅ Reconstrução de PROEZAS concluída!");
}

export default rebuildProezas;

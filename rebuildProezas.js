import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

async function rebuildProezas() {
  console.log("🔧 A reconstruir PROEZAS...");

  const users = await UserGames.find({});

  for (const user of users) {
    // Se não tiver conquistas antigas, passa à frente
    if (!user.conquistas || user.conquistas.length === 0) continue;

    // Converter conquistas → proezas
    const novasProezas = user.conquistas.map(c => ({
      nome: c.nome,
      data: c.data,
      plataforma: c.plataforma || null
    }));

    // Adicionar às proezas existentes
    user.proezas = [...user.proezas, ...novasProezas];

    // Limpar conquistas antigas
    user.conquistas = [];

    await user.save();

    // Atualizar UserStats
    const stats = await UserStats.findOne({ userId: user.userId });
    if (stats) {
      stats.totalProezas = user.proezas.length;
      stats.ultimaProeza = user.proezas[user.proezas.length - 1] || null;
      await stats.save();
    }

    console.log(`➡️ User ${user.userId}: ${novasProezas.length} proezas convertidas`);
  }

  console.log("✅ Reconstrução de PROEZAS concluída!");
}

export default rebuildProezas;

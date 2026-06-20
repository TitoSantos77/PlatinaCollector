import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

async function rebuildStatsProezas() {
  console.log("🔧 A sincronizar STATS de PROEZAS...");

  const users = await UserGames.find({});

  for (const user of users) {
    const proezas = user.proezas || [];

    let stats = await UserStats.findOne({ userId: user.userId });

    if (!stats) continue; // stats já existem, não criamos novos aqui

    stats.totalProezas = proezas.length;

    stats.ultimaProeza = proezas.length > 0
      ? {
          jogo: proezas[proezas.length - 1].jogo || null,
          plataforma: proezas[proezas.length - 1].plataforma || null,
          imagem: proezas[proezas.length - 1].imagem || null,
          data: proezas[proezas.length - 1].data || null
        }
      : null;

    await stats.save();

    console.log(`➡️ User ${user.userId}: ultimaProeza sincronizada`);
  }

  console.log("✅ Sincronização de STATS de PROEZAS concluída!");
}

export default rebuildStatsProezas;

import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

export default async function migrar() {
  console.log("🔵 Iniciando migração...");

  // -----------------------------
  // MIGRAR USERGAMES (conquistas -> proezas)
  // -----------------------------
  const usersGames = await UserGames.find();

  for (const user of usersGames) {
    let alterou = false;

    if (Array.isArray(user.conquistas) && user.conquistas.length > 0) {
      console.log(`➡️ Copiando conquistas -> proezas para user ${user.userId}`);

      if (!Array.isArray(user.proezas)) user.proezas = [];

      user.proezas.push(...user.conquistas);

      delete user.conquistas;
      alterou = true;
    }

    if (alterou) await user.save();
  }

  // -----------------------------
  // MIGRAR USERSTATS
  // -----------------------------
  const usersStats = await UserStats.find();

  for (const stats of usersStats) {
    let alterou = false;

    if (typeof stats.conquistas === "number") {
      console.log(`➡️ Migrando totalConquistas -> totalProezas para user ${stats.userId}`);

      stats.totalProezas = (stats.totalProezas || 0) + stats.conquistas;

      delete stats.conquistas;
      alterou = true;
    }

    if (stats.ultimaConquista) {
      console.log(`➡️ Migrando ultimaConquista -> ultimaProeza para user ${stats.userId}`);

      stats.ultimaProeza = stats.ultimaConquista;

      delete stats.ultimaConquista;
      alterou = true;
    }

    if (alterou) await stats.save();
  }

  console.log("✅ MIGRAÇÃO CONCLUÍDA — NADA FOI PERDIDO");
}

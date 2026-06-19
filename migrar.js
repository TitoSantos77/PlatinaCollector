import mongoose from "mongoose";
import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

const MONGO_URL = "mongodb://localhost:27017/platina"; // muda se for preciso

async function migrar() {
  await mongoose.connect(MONGO_URL);
  console.log("🔵 Ligado ao MongoDB");

  // -----------------------------
  // MIGRAR USERGAMES (conquistas -> proezas)
  // -----------------------------
  const usersGames = await UserGames.find();

  for (const user of usersGames) {
    let alterou = false;

    // Se existir "conquistas", copia para "proezas"
    if (Array.isArray(user.conquistas) && user.conquistas.length > 0) {
      console.log(`➡️ Copiando conquistas -> proezas para user ${user.userId}`);

      // Garante que proezas existe
      if (!Array.isArray(user.proezas)) user.proezas = [];

      // Copia sem apagar
      user.proezas.push(...user.conquistas);

      // Só depois de copiar, apaga o campo antigo
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

    // totalConquistas -> totalProezas
    if (typeof stats.conquistas === "number") {
      console.log(`➡️ Migrando totalConquistas -> totalProezas para user ${stats.userId}`);

      stats.totalProezas = (stats.totalProezas || 0) + stats.conquistas;

      delete stats.conquistas;
      alterou = true;
    }

    // ultimaConquista -> ultimaProeza
    if (stats.ultimaConquista) {
      console.log(`➡️ Migrando ultimaConquista -> ultimaProeza para user ${stats.userId}`);

      stats.ultimaProeza = stats.ultimaConquista;

      delete stats.ultimaConquista;
      alterou = true;
    }

    if (alterou) await stats.save();
  }

  console.log("✅ MIGRAÇÃO CONCLUÍDA — NADA FOI PERDIDO");
  process.exit();
}

migrar();

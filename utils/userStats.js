import UserStats from "../models/UserStats.js";

// Garante que o user existe e cria com os campos CORRETOS
async function garantirUser(userId) {
  let user = await UserStats.findOne({ userId });

  if (!user) {
    user = await UserStats.create({
      userId,
      totalPlatinas: 0,
      totalProezas: 0,
      ultimaPlatina: null,
      ultimaProeza: null,
      xp: 0,
      totalXP: 0,
      nivel: 1,
      badgesDesbloqueadas: []
    });
  }

  return user;
}

// Obter stats do utilizador (VERSÃO FINAL CORRIGIDA)
export async function getUserStats(userId) {
  await garantirUser(userId);

  // 🔥 LER DIRETAMENTE DO MONGO, SEM CACHE ANTIGO
  const user = await UserStats.findOne({ userId });

  return user;
}

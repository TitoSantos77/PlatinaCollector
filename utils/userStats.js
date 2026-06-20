import UserStats from "../models/UserStats.js";

// Garante que o user existe
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

// Atualizar PLATINA
async function atualizarStatsPlatina(userId, jogo, plataforma, imagem = null) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { totalPlatinas: 1 },
      $set: {
        ultimaPlatina: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado",
          imagem,
          data: new Date().toISOString()
        }
      }
    }
  );
}

// Atualizar PROEZA
async function atualizarStatsProeza(userId, jogo, plataforma, imagem = null) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { totalProezas: 1 },
      $set: {
        ultimaProeza: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado",
          imagem,
          data: new Date().toISOString()
        }
      }
    }
  );
}

// Obter stats ATUALIZADOS
async function getUserStats(userId) {
  await garantirUser(userId);
  return await UserStats.findOne({ userId });
}

export {
  atualizarStatsPlatina,
  atualizarStatsProeza,
  getUserStats
};

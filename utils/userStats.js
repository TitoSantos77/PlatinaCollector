import UserStats from "../models/UserStats.js";

async function garantirUser(userId) {
  let user = await UserStats.findOne({ userId });

  if (!user) {
    user = await UserStats.create({
      userId,
      totalPlatinas: 0,
      ultimaPlatina: null,
      totalCarreira: 0,
      ultimaCarreira: null,
      xp: 0,
      totalXP: 0,
      nivel: 1
    });
  }

  return user;
}

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

async function atualizarStatsCarreira(userId, categoria, subcategoria, plataforma, imagem = null) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { totalCarreira: 1 },
      $set: {
        ultimaCarreira: {
          categoria,
          subcategoria,
          plataforma,
          jogo: "Grand Theft Auto V",
          imagem,
          data: new Date().toISOString()
        }
      }
    }
  );
}

async function getUserStats(userId) {
  await garantirUser(userId);
  return UserStats.findOne({ userId });
}

export {
  atualizarStatsPlatina,
  atualizarStatsCarreira,
  getUserStats
};

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

// Atualizar PLATINA
export async function atualizarStatsPlatina(userId, jogo, plataforma, imagem = null) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { totalPlatinas: 1 },
      $set: {
        ultimaPlatina: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado",
          imagem: imagem,
          data: new Date().toISOString()
        }
      }
    },
    { new: true }
  );
}

// Atualizar PROEZA
export async function atualizarStatsProeza(userId, jogo, plataforma, imagem = null) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { totalProezas: 1 },
      $set: {
        ultimaProeza: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado",
          imagem: imagem,
          data: new Date().toISOString()
        }
      }
    },
    { new: true }
  );
}

// Obter stats do utilizador (VERSÃO FINAL)
export async function getUserStats(userId) {
  const user = await garantirUser(userId);
  return user;
}

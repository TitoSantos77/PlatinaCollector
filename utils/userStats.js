import UserStats from "../models/UserStats.js";

// Garantir que o documento existe
async function garantirUser(userId) {
  let user = await UserStats.findOne({ userId });

  if (!user) {
    user = await UserStats.create({
      userId,
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    });
  }

  return user;
}

// Atualizar platina
export async function atualizarStatsPlatina(userId, jogo, plataforma) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { platinas: 1 },
      $set: {
        ultimaPlatina: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado"
        }
      }
    },
    { new: true }
  );
}

// Atualizar conquista
export async function atualizarStatsConquista(userId, jogo, plataforma) {
  await garantirUser(userId);

  await UserStats.findOneAndUpdate(
    { userId },
    {
      $inc: { conquistas: 1 },
      $set: {
        ultimaConquista: {
          jogo: jogo || "Não especificado",
          plataforma: plataforma || "Não especificado"
        }
      }
    },
    { new: true }
  );
}

// Obter stats do utilizador
export async function getUserStats(userId) {
  const user = await UserStats.findOne({ userId });

  if (!user) {
    return {
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    };
  }

  return user;
}

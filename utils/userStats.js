import UserStats from "../models/UserStats.js";

// Garantir que o user existe e tem todos os campos necessários
async function garantirUser(userId) {
  let user = await UserStats.findOne({ userId });

  if (!user) {
    user = await UserStats.create({
      userId,

      // PLATINAS
      totalPlatinas: 0,
      ultimaPlatina: null,

      // PROEZAS (LEGADO)
      totalProezas: 0,
      ultimaProeza: null,

      // CARREIRA GTA — NOVO SISTEMA
      totalCarreira: 0,
      ultimaCarreira: null,
      categorias: {},
      subcategorias: {},
      plataformasCarreira: {},

      // XP / NÍVEL
      xp: 0,
      totalXP: 0,
      nivel: 1,

      // BADGES
      badgesDesbloqueadas: []
    });
  }

  // Garantir campos novos em users antigos
  user.totalCarreira = user.totalCarreira || 0;
  user.categorias = user.categorias || {};
  user.subcategorias = user.subcategorias || {};
  user.plataformasCarreira = user.plataformasCarreira || {};

  return user;
}

/* ============================
   PLATINA
============================ */
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

/* ============================
   PROEZA (LEGADO)
============================ */
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

/* ============================
   CARREIRA GTA — NOVO SISTEMA
============================ */
async function atualizarStatsCarreira(userId, categoria, subcategoria, plataforma, imagem = null) {
  const user = await garantirUser(userId);

  // Incrementar total
  user.totalCarreira += 1;

  // Atualizar contadores por categoria
  user.categorias[categoria] = (user.categorias[categoria] || 0) + 1;

  // Atualizar contadores por subcategoria
  user.subcategorias[subcategoria] = (user.subcategorias[subcategoria] || 0) + 1;

  // Atualizar contadores por plataforma
  user.plataformasCarreira[plataforma] =
    (user.plataformasCarreira[plataforma] || 0) + 1;

  // Guardar última entrada
  user.ultimaCarreira = {
    categoria,
    subcategoria,
    plataforma,
    jogo: "Grand Theft Auto V",
    imagem,
    data: new Date().toISOString()
  };

  await user.save();
}

/* ============================
   OBTER STATS
============================ */
async function getUserStats(userId) {
  await garantirUser(userId);
  return await UserStats.findOne({ userId });
}

export {
  atualizarStatsPlatina,
  atualizarStatsProeza,
  atualizarStatsCarreira,
  getUserStats
};

import UserStats from "../models/UserStats.js";

// ===============================
// XP BASE
// ===============================
export const XP_PLATINA = 100;
export const XP_PROEZA = 50;
export const XP_CARREIRA = 75;

// ===============================
// XP NECESSÁRIO POR NÍVEL
// ===============================
export function xpNecessario(nivel) {
  return nivel * 100;
}

// ===============================
// GARANTIR USER NO MONGO
// ===============================
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

      // CARREIRA GTA
      totalCarreira: 0,
      ultimaCarreira: null,
      categorias: {},
      subcategorias: {},
      plataformasCarreira: {},

      // XP / NÍVEL
      xp: 0,
      totalXP: 0,
      nivel: 1
    });
  }

  // Garantir campos em users antigos
  user.totalCarreira = user.totalCarreira || 0;
  user.categorias = user.categorias || {};
  user.subcategorias = user.subcategorias || {};
  user.plataformasCarreira = user.plataformasCarreira || {};
  user.xp = Number(user.xp) || 0;
  user.totalXP = Number(user.totalXP) || 0;
  user.nivel = Number(user.nivel) || 1;

  return user;
}

// ===============================
// ADICIONAR XP AO USER
// ===============================
export async function adicionarXP(userId, quantidade) {
  const user = await garantirUser(userId);

  const xpAtual = Number(user.xp) || 0;
  const totalXPAtual = Number(user.totalXP) || 0;
  const quantidadeValida = Number(quantidade) || 0;

  user.xp = xpAtual + quantidadeValida;
  user.totalXP = totalXPAtual + quantidadeValida;

  let xpNeeded = xpNecessario(user.nivel);

  while (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.nivel++;
    xpNeeded = xpNecessario(user.nivel);
  }

  await user.save();
  return user;
}

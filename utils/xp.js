import UserStats from "../models/UserStats.js";

// ===============================
// XP BASE
// ===============================
export const XP_PLATINA = 100;
export const XP_PROEZA = 50;

// 🟨 NOVO — XP para CARREIRA GTA
export const XP_CARREIRA = 75;

// XP extra das missões (se precisares)
export const XP_FACIL = 20;
export const XP_MEDIA = 25;
export const XP_DIFICIL = 30;

// ===============================
// XP NECESSÁRIO POR NÍVEL
// ===============================
export function xpNecessario(nivel) {
  return nivel * 100;
}

// ===============================
// BADGES AUTOMÁTICAS POR NÍVEL
// ===============================
export function getBadgeByLevel(nivel) {
  if (nivel >= 50) return "🟧 Colecionador Eterno";
  if (nivel >= 40) return "🟡 Guardião Supremo";
  if (nivel >= 30) return "🔥 Lenda dos Troféus";
  if (nivel >= 20) return "🟣 Mestre das Platinas";
  if (nivel >= 10) return "🔵 Caçador Experiente";
  if (nivel >= 5)  return "🟢 Caçador Novato";
  return "⚪ Iniciante";
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

      // 🟨 CARREIRA GTA — NOVO SISTEMA
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

// ===============================
// ATUALIZAR BADGE AUTOMÁTICA
// ===============================
function atualizarBadge(user) {
  const novaBadge = getBadgeByLevel(user.nivel);

  if (!user.badgesDesbloqueadas.includes(novaBadge)) {
    user.badgesDesbloqueadas.push(novaBadge);
  }
}

// ===============================
// ADICIONAR XP AO USER (CORRIGIDO)
// ===============================
export async function adicionarXP(userId, quantidade) {
  let user = await garantirUser(userId);

  // Garantir que xp e totalXP são números válidos
  const xpAtual = Number(user.xp) || 0;
  const totalXPAtual = Number(user.totalXP) || 0;

  const novoXP = xpAtual + quantidade;
  const novoTotalXP = totalXPAtual + quantidade;

  user.xp = novoXP;
  user.totalXP = novoTotalXP;

  let xpNeeded = xpNecessario(user.nivel);

  // Subir de nível em loop
  while (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.nivel++;

    atualizarBadge(user);

    xpNeeded = xpNecessario(user.nivel);
  }

  await user.save();
  return user;
}

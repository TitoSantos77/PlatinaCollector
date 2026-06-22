import UserStats from "../models/UserStats.js";

// XP base
export const XP_PLATINA = 100;
export const XP_PROEZA = 50; // <-- atualizado

// XP extra das missões
export const XP_FACIL = 20;
export const XP_MEDIA = 25;
export const XP_DIFICIL = 30;

// XP necessário para subir de nível
export function xpNecessario(nivel) {
  return nivel * 100;
}

// BADGES POR NÍVEL (PORTUGUÊS)
export function getBadgeByLevel(nivel) {
  if (nivel >= 50) return "🟧 Colecionador Eterno";
  if (nivel >= 40) return "🟡 Guardião Supremo";
  if (nivel >= 30) return "🔥 Lenda dos Troféus";
  if (nivel >= 20) return "🟣 Mestre das Platinas";
  if (nivel >= 10) return "🔵 Caçador Experiente";
  if (nivel >= 5)  return "🟢 Caçador Novato";
  return "⚪ Iniciante";
}

// Garantir documento no Mongo
async function garantirUser(userId) {
  let user = await UserStats.findOne({ userId });

  if (!user) {
    user = await UserStats.create({
      userId,
      platinas: 0,
      proezas: 0, // <-- atualizado
      ultimaPlatina: null,
      ultimaProeza: null, // <-- atualizado
      xp: 0,
      totalXP: 0,
      nivel: 1,
      badge: "⚪ Iniciante",
      badgesDesbloqueadas: ["⚪ Iniciante"]
    });
  }

  return user;
}

// Atualiza badge atual + badges desbloqueadas
function atualizarBadge(user) {
  const novaBadge = getBadgeByLevel(user.nivel);

  if (user.badge !== novaBadge) {
    user.badge = novaBadge;

    if (!user.badgesDesbloqueadas) {
      user.badgesDesbloqueadas = [];
    }

    if (!user.badgesDesbloqueadas.includes(novaBadge)) {
      user.badgesDesbloqueadas.push(novaBadge);
    }
  }
}

// Adiciona XP ao user (AGORA NO MONGO)
export async function adicionarXP(userId, quantidade) {
  let user = await garantirUser(userId);

  user.xp += quantidade;
  user.totalXP += quantidade;

  let xpNeeded = xpNecessario(user.nivel);

  while (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.nivel++;

    atualizarBadge(user);

    xpNeeded = xpNecessario(user.nivel);
  }

  await user.save();

  return user;
}

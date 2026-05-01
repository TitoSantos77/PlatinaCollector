import User from "../models/User.js";
import { criarBackup } from "./backup.js";
import { verificarBadges } from "./badges.js";

// XP base
export const XP_PLATINA = 100;
export const XP_CONQUISTA = 50;

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

// Atualiza badge atual + badges desbloqueadas
function atualizarBadge(user) {
  const novaBadge = getBadgeByLevel(user.nivel);

  if (user.badge !== novaBadge) {
    user.badge = novaBadge;

    if (!user.badgesDesbloqueadas.includes(novaBadge)) {
      user.badgesDesbloqueadas.push(novaBadge);
    }
  }
}

// 🔵 ADICIONAR XP AO USER (VERSÃO MONGODB)
export async function adicionarXP(userId, quantidade) {
  let user = await User.findOne({ userId });

  // Criar user se não existir
  if (!user) {
    user = await User.create({
      userId,
      xp: 0,
      nivel: 1,
      totalXP: 0,
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null,
      badge: "⚪ Iniciante",
      badgesDesbloqueadas: ["⚪ Iniciante"]
    });
  }

  // XP
  user.xp += quantidade;
  user.totalXP += quantidade;

  // Subir de nível
  let xpNeeded = xpNecessario(user.nivel);

  while (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.nivel++;

    atualizarBadge(user);

    xpNeeded = xpNecessario(user.nivel);
  }

  await user.save();

  // Backup para manter compatibilidade
  criarBackup();

  // Verificar badges externas
  verificarBadges(userId);

  return user;
}

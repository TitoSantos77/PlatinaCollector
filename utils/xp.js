import UserStats from "../models/UserStats.js";

export const XP_PLATINA = 100;
export const XP_CARREIRA = 75;

export function xpNecessario(nivel) {
  return nivel * 100;
}

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

  user.xp = Number(user.xp) || 0;
  user.totalXP = Number(user.totalXP) || 0;
  user.nivel = Number(user.nivel) || 1;

  return user;
}

export async function adicionarXP(userId, quantidade) {
  const user = await garantirUser(userId);
  const quantidadeValida = Number(quantidade) || 0;

  user.xp += quantidadeValida;
  user.totalXP += quantidadeValida;

  let xpNeeded = xpNecessario(user.nivel);

  while (user.xp >= xpNeeded) {
    user.xp -= xpNeeded;
    user.nivel++;
    xpNeeded = xpNecessario(user.nivel);
  }

  await user.save();
  return user;
}

import User from "../models/User.js";
import UserStats from "../models/UserStats.js";
import Badge from "../models/Badge.js";

export async function verificarBadges(userId) {
  const user = await User.findOne({ userId });
  const stats = await UserStats.findOne({ userId });
  const badgesDB = await Badge.find();

  if (!user) return false;

  if (!user.badgesDesbloqueadas) {
    user.badgesDesbloqueadas = [];
  }

  let ganhouNova = false;

  for (const badge of badgesDB) {
    const id = badge.id;

    // Já tem esta badge?
    if (user.badgesDesbloqueadas.includes(id)) continue;

    const req = badge.requisito || {};

    const cumpreNivel = req.nivel ? user.nivel >= req.nivel : true;
    const cumpreXP = req.xp ? user.totalXP >= req.xp : true;

    const cumprePlatinas = req.platinas
      ? (stats?.platinas || 0) >= req.platinas
      : true;

    const cumpreConquistas = req.conquistas
      ? (stats?.conquistas || 0) >= req.conquistas
      : true;

    const cumpreMissoes = req.missoes
      ? (stats?.missoesConcluidas || 0) >= req.missoes
      : true;

    if (
      cumpreNivel &&
      cumpreXP &&
      cumprePlatinas &&
      cumpreConquistas &&
      cumpreMissoes
    ) {
      user.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await user.save();
  return ganhouNova;
}

import UserStats from "../models/UserStats.js";
import Badge from "../models/Badge.js";

export async function verificarBadges(userId) {
  const stats = await UserStats.findOne({ userId });
  const badgesDB = await Badge.find();

  if (!stats) return false;

  if (!stats.badgesDesbloqueadas) {
    stats.badgesDesbloqueadas = [];
  }

  let ganhouNova = false;

  for (const badge of badgesDB) {
    const id = badge.id;

    // Já tem esta badge?
    if (stats.badgesDesbloqueadas.includes(id)) continue;

    const req = badge.requisito || {};

    const cumpreNivel = req.nivel ? stats.nivel >= req.nivel : true;
    const cumpreXP = req.xp ? stats.totalXP >= req.xp : true;

    const cumprePlatinas = req.platinas
      ? (stats.totalPlatinas || 0) >= req.platinas
      : true;

    const cumpreProezas = req.proezas
      ? (stats.totalProezas || 0) >= req.proezas
      : true;

    const cumpreMissoes = req.missoes
      ? (stats.missoesConcluidas || 0) >= req.missoes
      : true;

    if (
      cumpreNivel &&
      cumpreXP &&
      cumprePlatinas &&
      cumpreProezas &&
      cumpreMissoes
    ) {
      stats.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await stats.save();
  return ganhouNova;
}

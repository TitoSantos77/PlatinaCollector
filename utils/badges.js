import UserStats from "../models/UserStats.js";
import { readJSON } from "./database.js";

export async function verificarBadges(userId) {
  const badgesDB = readJSON("data/badges.json");

  // Buscar stats corretas (XP, nível, platinas, conquistas)
  let stats = await UserStats.findOne({ userId });
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
    const cumprePlatinas = req.platinas ? stats.platinas >= req.platinas : true;
    const cumpreConquistas = req.conquistas ? stats.conquistas >= req.conquistas : true;
    const cumpreMissoes = req.missoes ? (stats.missoesConcluidas || 0) >= req.missoes : true;

    if (cumpreNivel && cumpreXP && cumprePlatinas && cumpreConquistas && cumpreMissoes) {
      stats.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await stats.save();
  return ganhouNova;
}

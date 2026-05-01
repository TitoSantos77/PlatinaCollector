import User from "../models/User.js";        // <-- Agora usa o model correto
import UserStats from "../models/UserStats.js";
import { readJSON } from "./database.js";

// Verificar badges com MongoDB
export async function verificarBadges(userId) {
  const badgesDB = readJSON("data/badges.json");

  // Buscar XP + nível + badges do Mongo
  let user = await User.findOne({ userId });
  if (!user) return false;

  // Buscar stats (platinas, conquistas, missões)
  let stats = await UserStats.findOne({ userId });
  if (!stats) return false;

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
    const cumprePlatinas = req.platinas ? stats.platinas >= req.platinas : true;
    const cumpreConquistas = req.conquistas ? stats.conquistas >= req.conquistas : true;
    const cumpreMissoes = req.missoes ? (stats.missoesConcluidas || 0) >= req.missoes : true;

    if (cumpreNivel && cumpreXP && cumprePlatinas && cumpreConquistas && cumpreMissoes) {
      user.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await user.save();
  return ganhouNova;
}

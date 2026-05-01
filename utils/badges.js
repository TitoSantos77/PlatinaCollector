import { readJSON, writeJSON } from "./database.js";

export function verificarBadges(userId) {
  const badgesDB = readJSON("data/badges.json");
  const users = readJSON("data/users.json");
  const stats = readJSON("data/userStats.json");

  const user = users[userId] || {};
  const userStats = stats[userId] || {};

  if (!user.badgesDesbloqueadas) user.badgesDesbloqueadas = [];

  let ganhouNova = false;

  for (const badge of badgesDB) {
    const id = badge.id;

    // Já tem esta badge?
    if (user.badgesDesbloqueadas.includes(id)) continue;

    const req = badge.requisito || {};

    const cumpreNivel = req.nivel ? (user.nivel || 1) >= req.nivel : true;
    const cumpreXP = req.xp ? (user.totalXP || 0) >= req.xp : true;
    const cumprePlatinas = req.platinas ? (userStats.platinas || 0) >= req.platinas : true;
    const cumpreConquistas = req.conquistas ? (userStats.conquistas || 0) >= req.conquistas : true;
    const cumpreMissoes = req.missoes ? (userStats.missoesConcluidas || 0) >= req.missoes : true;

    if (cumpreNivel && cumpreXP && cumprePlatinas && cumpreConquistas && cumpreMissoes) {
      user.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  users[userId] = user;
  writeJSON("data/users.json", users);

  return ganhouNova;
}

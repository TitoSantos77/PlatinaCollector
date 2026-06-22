import UserStats from "../models/UserStats.js";
import { readJSON } from "./database.js";

export async function verificarBadges(userId) {
  const badgesDB = readJSON("data/badges.json");

  let stats = await UserStats.findOne({ userId });
  if (!stats) return false;

  // Garantir que existe o array
  if (!Array.isArray(stats.badgesDesbloqueadas)) {
    stats.badgesDesbloqueadas = [];
  }

  let ganhouNova = false;

  for (const badge of badgesDB) {
    const id = badge.id;
    if (!id) continue;

    // Já tem esta badge?
    if (stats.badgesDesbloqueadas.includes(id)) continue;

    const req = badge.requisito || {};

    // ✔ Correto
    const cumpreNivel = req.nivel ? stats.nivel >= req.nivel : true;

    // ✔ Correto
    const cumpreXP = req.xp ? stats.totalXP >= req.xp : true;

    // 🔧 CORRIGIDO — antes lia stats.platinas (que não existe)
    const cumprePlatinas = req.platinas
      ? (stats.totalPlatinas || 0) >= req.platinas
      : true;

    // 🔧 CORRIGIDO — antes lia stats.conquistas (que não existe)
    const cumpreConquistas = req.conquistas
      ? (stats.totalProezas || 0) >= req.conquistas
      : true;

    // ✔ Mantido
    const cumpreMissoes = req.missoes
      ? (stats.missoesConcluidas || 0) >= req.missoes
      : true;

    // Se cumpre todos os requisitos → desbloqueia
    if (cumpreNivel && cumpreXP && cumprePlatinas && cumpreConquistas && cumpreMissoes) {
      stats.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await stats.save();
  return ganhouNova;
}

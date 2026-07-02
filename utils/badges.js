import UserStats from "../models/UserStats.js";
import { readJSON } from "./database.js";

export async function verificarBadges(userId) {
  const badgesDB = readJSON("data/badges.json");

  let stats = await UserStats.findOne({ userId });
  if (!stats) return false;

  // Garantir arrays e contadores
  if (!Array.isArray(stats.badgesDesbloqueadas)) {
    stats.badgesDesbloqueadas = [];
  }

  stats.totalPlatinas = stats.totalPlatinas || 0;
  stats.totalProezas = stats.totalProezas || 0; // legado
  stats.totalCarreira = stats.totalCarreira || 0;

  stats.categorias = stats.categorias || {};
  stats.subcategorias = stats.subcategorias || {};
  stats.plataformasCarreira = stats.plataformasCarreira || {};

  let ganhouNova = false;

  for (const badge of badgesDB) {
    const id = badge.id;
    if (!id) continue;

    // Já tem esta badge?
    if (stats.badgesDesbloqueadas.includes(id)) continue;

    const req = badge.requisito || {};

    // ✔ Requisitos gerais
    const cumpreNivel = req.nivel ? stats.nivel >= req.nivel : true;
    const cumpreXP = req.xp ? stats.totalXP >= req.xp : true;
    const cumpreMissoes = req.missoes ? stats.missoesConcluidas >= req.missoes : true;

    // ✔ Platinas
    const cumprePlatinas = req.platinas
      ? stats.totalPlatinas >= req.platinas
      : true;

    // ✔ Proezas antigas (legado)
    const cumpreProezas = req.proezas
      ? stats.totalProezas >= req.proezas
      : true;

    // 🟨 NOVO — Carreira GTA
    const cumpreCarreira = req.carreira
      ? stats.totalCarreira >= req.carreira
      : true;

    // 🟨 NOVO — Categorias completas
    const cumpreCategorias = req.categorias
      ? Object.keys(stats.categorias).length >= req.categorias
      : true;

    // 🟨 NOVO — Subcategorias completas
    const cumpreSubcategorias = req.subcategorias
      ? Object.keys(stats.subcategorias).length >= req.subcategorias
      : true;

    // 🟨 NOVO — Plataformas carreira
    const cumprePlataformasCarreira = req.plataformasCarreira
      ? Object.keys(stats.plataformasCarreira).length >= req.plataformasCarreira
      : true;

    // ✔ Se cumpre tudo → desbloqueia badge
    if (
      cumpreNivel &&
      cumpreXP &&
      cumpreMissoes &&
      cumprePlatinas &&
      cumpreProezas &&
      cumpreCarreira &&
      cumpreCategorias &&
      cumpreSubcategorias &&
      cumprePlataformasCarreira
    ) {
      stats.badgesDesbloqueadas.push(id);
      ganhouNova = true;
    }
  }

  await stats.save();
  return ganhouNova;
}

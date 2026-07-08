import GlobalStats from "../models/GlobalStats.js";

export async function fixGlobalStats() {
  const stats = await GlobalStats.findOne();
  if (!stats) return;

  let changed = false;

  // Converter categoriasCarreira
  if (stats.categoriasCarreira && !Array.isArray(stats.categoriasCarreira)) {
    stats.categoriasCarreira = Object.keys(stats.categoriasCarreira);
    changed = true;
  }

  // Converter subcategoriasCarreira
  if (stats.subcategoriasCarreira && !Array.isArray(stats.subcategoriasCarreira)) {
    stats.subcategoriasCarreira = Object.keys(stats.subcategoriasCarreira);
    changed = true;
  }

  // Converter plataformasCarreira
  if (stats.plataformasCarreira && !Array.isArray(stats.plataformasCarreira)) {
    stats.plataformasCarreira = Object.keys(stats.plataformasCarreira);
    changed = true;
  }

  if (changed) {
    await stats.save();
    console.log("✔ GlobalStats corrigido sem apagar dados.");
  } else {
    console.log("✔ GlobalStats já está correto.");
  }
}

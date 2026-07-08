import GlobalStats from "../models/GlobalStats.js";

export async function fixGlobalStats() {
  const stats = await GlobalStats.findOne();
  if (!stats) return;

  let changed = false;

  // Criar arrays se não existirem
  if (!stats.categoriasCarreira) {
    stats.categoriasCarreira = [];
    changed = true;
  }

  if (!stats.subcategoriasCarreira) {
    stats.subcategoriasCarreira = [];
    changed = true;
  }

  if (!stats.plataformasCarreira) {
    stats.plataformasCarreira = [];
    changed = true;
  }

  // Converter objetos antigos → arrays
  if (!Array.isArray(stats.categoriasCarreira)) {
    stats.categoriasCarreira = Object.keys(stats.categoriasCarreira);
    changed = true;
  }

  if (!Array.isArray(stats.subcategoriasCarreira)) {
    stats.subcategoriasCarreira = Object.keys(stats.subcategoriasCarreira);
    changed = true;
  }

  if (!Array.isArray(stats.plataformasCarreira)) {
    stats.plataformasCarreira = Object.keys(stats.plataformasCarreira);
    changed = true;
  }

  if (changed) {
    await stats.save();
    console.log("✔ GlobalStats corrigido (campos criados e convertidos).");
  } else {
    console.log("✔ GlobalStats já estava correto.");
  }
}

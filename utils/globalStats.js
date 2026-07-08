import GlobalStats from "../models/GlobalStats.js";

// Garantir documento único
async function garantirStats() {
  let stats = await GlobalStats.findOne();
  if (!stats) {
    stats = await GlobalStats.create({
      jogos: {},
      plataformas: {},
      categoriasCarreira: [],
      subcategoriasCarreira: [],
      plataformasCarreira: []
    });
  }
  return stats;
}

/* ============================
   PLATINAS (MAP)
============================ */

export async function adicionarJogo(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.jogos.set(nome, (stats.jogos.get(nome) || 0) + 1);
  await stats.save();
}

export async function adicionarPlataforma(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.plataformas.set(nome, (stats.plataformas.get(nome) || 0) + 1);
  await stats.save();
}

/* ============================
   CARREIRA GTA (ARRAYS)
============================ */

export async function adicionarCategoriaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.categoriasCarreira.push(nome);
  await stats.save();
}

export async function adicionarSubcategoriaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.subcategoriasCarreira.push(nome);
  await stats.save();
}

export async function adicionarPlataformaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.plataformasCarreira.push(nome);
  await stats.save();
}

export async function removerCategoriaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.categoriasCarreira = stats.categoriasCarreira.filter(c => c !== nome);
  await stats.save();
}

export async function removerSubcategoriaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.subcategoriasCarreira = stats.subcategoriasCarreira.filter(s => s !== nome);
  await stats.save();
}

export async function removerPlataformaCarreira(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.plataformasCarreira = stats.plataformasCarreira.filter(p => p !== nome);
  await stats.save();
}

export async function obterCategoriasCarreira() {
  const stats = await garantirStats();
  return stats.categoriasCarreira;
}

export async function obterSubcategoriasCarreira() {
  const stats = await garantirStats();
  return stats.subcategoriasCarreira;
}

export async function obterPlataformasCarreira() {
  const stats = await garantirStats();
  return stats.plataformasCarreira;
}

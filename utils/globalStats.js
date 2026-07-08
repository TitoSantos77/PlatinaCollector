import GlobalStats from "../models/GlobalStats.js";

// Garantir documento único
async function garantirStats() {
  let stats = await GlobalStats.findOne();
  if (!stats) {
    stats = await GlobalStats.create({
      jogos: [],
      plataformas: [],
      categoriasCarreira: [],
      subcategoriasCarreira: [],
      plataformasCarreira: []   // <-- CORRIGIDO
    });
  }
  return stats;
}

/* ============================
   PLATINAS
============================ */

export async function adicionarJogo(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.jogos.push(nome);
  await stats.save();
}

export async function adicionarPlataforma(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.plataformas.push(nome);
  await stats.save();
}

export async function removerJogo(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.jogos = stats.jogos.filter(j => j !== nome);
  await stats.save();
}

export async function removerPlataforma(nome) {
  if (!nome) return;
  const stats = await garantirStats();
  stats.plataformas = stats.plataformas.filter(p => p !== nome);
  await stats.save();
}

export async function obterJogos() {
  const stats = await garantirStats();
  return stats.jogos;
}

export async function obterPlataformas() {
  const stats = await garantirStats();
  return stats.plataformas;
}

/* ============================
   CARREIRA GTA
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
  stats.plataformasCarreira.push(nome);   // <-- CORRIGIDO
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
  stats.plataformasCarreira = stats.plataformasCarreira.filter(p => p !== nome);  // <-- CORRIGIDO
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
  return stats.plataformasCarreira;   // <-- CORRIGIDO
}

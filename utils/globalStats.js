import GlobalStats from "../models/GlobalStats.js";

// Garantir documento único
async function garantirStats() {
  let stats = await GlobalStats.findOne();
  if (!stats) {
    stats = await GlobalStats.create({
      jogos: new Map(),
      plataformas: new Map(),

      // NOVO — Carreira GTA
      categoriasCarreira: new Map(),
      subcategoriasCarreira: new Map(),
      plataformasCarreira: new Map()
    });
  }
  return stats;
}

/* ============================
   PLATINAS (já existente)
============================ */

export async function adicionarJogo(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.jogos.get(nome) || 0;
  stats.jogos.set(nome, atual + 1);
  await stats.save();
}

export async function adicionarPlataforma(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.plataformas.get(nome) || 0;
  stats.plataformas.set(nome, atual + 1);
  await stats.save();
}

export async function removerJogo(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.jogos.get(nome);
  if (!atual) return;

  if (atual <= 1) stats.jogos.delete(nome);
  else stats.jogos.set(nome, atual - 1);

  await stats.save();
}

export async function removerPlataforma(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.plataformas.get(nome);
  if (!atual) return;

  if (atual <= 1) stats.plataformas.delete(nome);
  else stats.plataformas.set(nome, atual - 1);

  await stats.save();
}

export async function obterJogos() {
  const stats = await garantirStats();
  return Array.from(stats.jogos.keys());
}

export async function obterPlataformas() {
  const stats = await garantirStats();
  return Array.from(stats.plataformas.keys());
}

/* ============================
   CARREIRA GTA — NOVO SISTEMA
============================ */

export async function adicionarCategoriaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.categoriasCarreira.get(nome) || 0;
  stats.categoriasCarreira.set(nome, atual + 1);
  await stats.save();
}

export async function adicionarSubcategoriaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.subcategoriasCarreira.get(nome) || 0;
  stats.subcategoriasCarreira.set(nome, atual + 1);
  await stats.save();
}

export async function adicionarPlataformaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.plataformasCarreira.get(nome) || 0;
  stats.plataformasCarreira.set(nome, atual + 1);
  await stats.save();
}

export async function removerCategoriaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.categoriasCarreira.get(nome);
  if (!atual) return;

  if (atual <= 1) stats.categoriasCarreira.delete(nome);
  else stats.categoriasCarreira.set(nome, atual - 1);

  await stats.save();
}

export async function removerSubcategoriaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.subcategoriasCarreira.get(nome);
  if (!atual) return;

  if (atual <= 1) stats.subcategoriasCarreira.delete(nome);
  else stats.subcategoriasCarreira.set(nome, atual - 1);

  await stats.save();
}

export async function removerPlataformaCarreira(nome) {
  if (!nome) return;

  const stats = await garantirStats();
  const atual = stats.plataformasCarreira.get(nome);
  if (!atual) return;

  if (atual <= 1) stats.plataformasCarreira.delete(nome);
  else stats.plataformasCarreira.set(nome, atual - 1);

  await stats.save();
}

export async function obterCategoriasCarreira() {
  const stats = await garantirStats();
  return Array.from(stats.categoriasCarreira.keys());
}

export async function obterSubcategoriasCarreira() {
  const stats = await garantirStats();
  return Array.from(stats.subcategoriasCarreira.keys());
}

export async function obterPlataformasCarreira() {
  const stats = await garantirStats();
  return Array.from(stats.plataformasCarreira.keys());
}

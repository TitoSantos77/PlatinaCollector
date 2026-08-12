import GlobalStats from "../models/GlobalStats.js";

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

// PLATINAS
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

export async function obterJogos() {
  const stats = await garantirStats();
  return Array.from(stats.jogos.keys());
}

export async function obterPlataformas() {
  const stats = await garantirStats();
  return Array.from(stats.plataformas.keys());
}

// CARREIRA GTA
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

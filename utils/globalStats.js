import GlobalStats from "../models/GlobalStats.js";

// Garantir documento único
async function garantirStats() {
  let stats = await GlobalStats.findOne();
  if (!stats) {
    stats = await GlobalStats.create({});
  }
  return stats;
}

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

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

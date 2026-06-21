async function calcularXP(userId) {
  let stats = await UserStats.findOne({ userId });
  const missions = await UserMissions.findOne({ userId });

  // SE NÃO EXISTE USERSTATS → CRIAR UM NOVO
  if (!stats) {
    stats = await UserStats.create({
      userId,
      xp: 0,
      totalXP: 0,
      nivel: 1,
      totalPlatinas: 0,
      totalProezas: 0
    });
  }

  const totalPlatinas = Number(stats.totalPlatinas) || 0;
  const totalProezas = Number(stats.totalProezas) || 0;

  const xpPlatinas = totalPlatinas * 100;
  const xpProezas = totalProezas * 50;

  let xpMissoes = 0;

  if (missions?.historico?.length) {
    for (const m of missions.historico) {
      xpMissoes += Number(m.recompensa) || 0;
    }
  }

  const totalXP = xpPlatinas + xpProezas + xpMissoes;
  const nivel = Math.floor(totalXP / 100) + 1;
  const xpAtual = totalXP % 100;

  await UserStats.findOneAndUpdate(
    { userId },
    { xp: xpAtual, totalXP, nivel }
  );

  return { totalXP, nivel, xpAtual, xpPlatinas, xpProezas, xpMissoes };
}

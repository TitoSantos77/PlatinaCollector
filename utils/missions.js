import { readJSON, writeJSON } from "./database.js";
import { XP_FACIL, XP_MEDIA, XP_DIFICIL, adicionarXP } from "./xp.js";
import { criarBackup } from "./backup.js";
import { verificarBadges } from "./badges.js"; // <-- ADICIONADO

// Lista oficial das missões
export const MISSOES = [
  // ... (tudo igual, não mexi)
];

// Gera missão semanal para um user
export function gerarMissao(userId) {
  const missions = readJSON("data/missions.json");

  const missao = MISSOES[Math.floor(Math.random() * MISSOES.length)];

  if (!missions[userId]) {
    missions[userId] = { atual: null, historico: [] };
  }

  missions[userId].atual = {
    id: missao.id,
    descricao: missao.descricao,
    objetivo: missao.objetivo,
    progresso: { platinas: 0, conquistas: 0, xp: 0 },
    recompensa: missao.recompensa,
    requerJogo: missao.requerJogo || false,
    concluida: false,
    dataInicio: new Date().toISOString().split("T")[0]
  };

  writeJSON("data/missions.json", missions);
  criarBackup();

  return missions[userId].atual;
}

// Atualiza progresso quando user faz platina/conquista
export function atualizarProgresso(userId, tipo, temJogo) {
  const missions = readJSON("data/missions.json");
  if (!missions[userId] || !missions[userId].atual) return;

  const missao = missions[userId].atual;

  if (missao.concluida) return;

  if (missao.requerJogo && !temJogo) return;

  if (tipo === "platina") missao.progresso.platinas++;
  if (tipo === "conquista") missao.progresso.conquistas++;

  writeJSON("data/missions.json", missions);
  criarBackup();

  verificarConclusao(userId);

  // 🟣 VERIFICAR BADGES POR PROGRESSO
  verificarBadges(userId);
}

// Atualiza progresso de XP semanal
export function adicionarXPsemana(userId, quantidade) {
  const missions = readJSON("data/missions.json");
  if (!missions[userId] || !missions[userId].atual) return;

  const missao = missions[userId].atual;

  if (missao.concluida) return;

  missao.progresso.xp += quantidade;

  writeJSON("data/missions.json", missions);
  criarBackup();

  verificarConclusao(userId);

  // 🟣 VERIFICAR BADGES POR XP SEMANAL
  verificarBadges(userId);
}

// Verifica se a missão foi concluída
export function verificarConclusao(userId) {
  const missions = readJSON("data/missions.json");
  const missao = missions[userId]?.atual;
  if (!missao) return;

  const obj = missao.objetivo;
  const prog = missao.progresso;

  const concluida =
    prog.platinas >= obj.platinas &&
    prog.conquistas >= obj.conquistas &&
    prog.xp >= obj.xp;

  if (!concluida) return;

  missao.concluida = true;
  missao.dataFim = new Date().toISOString().split("T")[0];

  adicionarXP(userId, missao.recompensa);

  missions[userId].historico.push(missao);

  missions[userId].atual = null;

  writeJSON("data/missions.json", missions);
  criarBackup();

  // 🟣 VERIFICAR BADGES POR MISSÃO CONCLUÍDA
  verificarBadges(userId);

  return true;
}

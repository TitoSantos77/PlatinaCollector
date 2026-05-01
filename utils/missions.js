import { readJSON, writeJSON } from "./database.js";
import { XP_FACIL, XP_MEDIA, XP_DIFICIL, adicionarXP } from "./xp.js";
import { criarBackup } from "./backup.js";

// Lista oficial das missões
export const MISSOES = [
  // Platinas
  { id: 1, descricao: "Fazer 1 platina", objetivo: { platinas: 1, conquistas: 0, xp: 0 }, recompensa: XP_FACIL },
  { id: 2, descricao: "Fazer 2 platinas", objetivo: { platinas: 2, conquistas: 0, xp: 0 }, recompensa: XP_MEDIA },
  { id: 3, descricao: "Fazer 3 platinas", objetivo: { platinas: 3, conquistas: 0, xp: 0 }, recompensa: XP_DIFICIL },
  { id: 4, descricao: "Fazer 1 platina e mencionar o jogo", objetivo: { platinas: 1, conquistas: 0, xp: 0 }, recompensa: XP_FACIL, requerJogo: true },

  // Conquistas
  { id: 5, descricao: "Fazer 3 conquistas", objetivo: { platinas: 0, conquistas: 3, xp: 0 }, recompensa: XP_FACIL },
  { id: 6, descricao: "Fazer 5 conquistas", objetivo: { platinas: 0, conquistas: 5, xp: 0 }, recompensa: XP_MEDIA },
  { id: 7, descricao: "Fazer 10 conquistas", objetivo: { platinas: 0, conquistas: 10, xp: 0 }, recompensa: XP_DIFICIL },
  { id: 8, descricao: "Fazer 1 conquista e mencionar o jogo", objetivo: { platinas: 0, conquistas: 1, xp: 0 }, recompensa: XP_FACIL, requerJogo: true },

  // Mistas
  { id: 9, descricao: "Fazer 1 platina + 1 conquista", objetivo: { platinas: 1, conquistas: 1, xp: 0 }, recompensa: XP_FACIL },
  { id: 10, descricao: "Fazer 1 platina + 2 conquistas", objetivo: { platinas: 1, conquistas: 2, xp: 0 }, recompensa: XP_MEDIA },
  { id: 11, descricao: "Fazer 1 platina + 5 conquistas", objetivo: { platinas: 1, conquistas: 5, xp: 0 }, recompensa: XP_MEDIA },
  { id: 12, descricao: "Fazer 2 platinas + 1 conquista", objetivo: { platinas: 2, conquistas: 1, xp: 0 }, recompensa: XP_MEDIA },
  { id: 13, descricao: "Fazer 2 platinas + 3 conquistas", objetivo: { platinas: 2, conquistas: 3, xp: 0 }, recompensa: XP_DIFICIL },

  // XP total
  { id: 14, descricao: "Ganhar 150 XP esta semana", objetivo: { platinas: 0, conquistas: 0, xp: 150 }, recompensa: XP_DIFICIL },
  { id: 15, descricao: "Ganhar 300 XP esta semana", objetivo: { platinas: 0, conquistas: 0, xp: 300 }, recompensa: XP_DIFICIL }
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

  return true;
}

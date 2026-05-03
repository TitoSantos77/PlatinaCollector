import UserMissions from "../models/UserMissions.js";
import { adicionarXP } from "./xp.js";
import { verificarBadges } from "./badges.js";
import { MISSOES } from "./missionsList.js";

// Garantir documento
async function garantirUser(userId) {
  let doc = await UserMissions.findOne({ userId });
  if (!doc) {
    doc = await UserMissions.create({ userId, historico: [] });
  }

  // Garantir estrutura válida (anti-NaN)
  if (!doc.atual) return doc;

  doc.atual.progresso = {
    platinas: Number(doc.atual.progresso?.platinas) || 0,
    conquistas: Number(doc.atual.progresso?.conquistas) || 0,
    xp: Number(doc.atual.progresso?.xp) || 0
  };

  return doc;
}

// Gerar missão semanal
export async function gerarMissao(userId) {
  const missao = MISSOES[Math.floor(Math.random() * MISSOES.length)];
  const doc = await garantirUser(userId);

  doc.atual = {
    id: missao.id,
    descricao: missao.descricao,
    objetivo: missao.objetivo,
    progresso: { platinas: 0, conquistas: 0, xp: 0 },
    recompensa: missao.recompensa,
    requerJogo: missao.requerJogo || false,
    concluida: false,
    dataInicio: new Date().toISOString().split("T")[0]
  };

  await doc.save();
  return doc.atual;
}

// Atualizar progresso
export async function atualizarProgresso(userId, tipo, temJogo) {
  const doc = await garantirUser(userId);
  if (!doc.atual || doc.atual.concluida) return;

  if (doc.atual.requerJogo && !temJogo) return;

  // Garantir números válidos
  doc.atual.progresso.platinas = Number(doc.atual.progresso.platinas) || 0;
  doc.atual.progresso.conquistas = Number(doc.atual.progresso.conquistas) || 0;

  if (tipo === "platina") doc.atual.progresso.platinas += 1;
  if (tipo === "conquista") doc.atual.progresso.conquistas += 1;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// XP semanal
export async function adicionarXPsemana(userId, quantidade) {
  const doc = await garantirUser(userId);
  if (!doc.atual || doc.atual.concluida) return;

  doc.atual.progresso.xp = Number(doc.atual.progresso.xp) || 0;
  doc.atual.progresso.xp += quantidade;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// Verificar conclusão
export async function verificarConclusao(userId) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;
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

  await adicionarXP(userId, missao.recompensa);

  doc.historico.push(missao);
  doc.atual = null;

  await doc.save();
  await verificarBadges(userId);

  return true;
}

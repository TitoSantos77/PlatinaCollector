import UserMissions from "../models/UserMissions.js";
import UserStats from "../models/UserStats.js";
import { adicionarXP } from "./xp.js";
import { verificarBadges } from "./badges.js";
import { MISSOES } from "../data/missoesLista.js";

// 🔵 GARANTIR DOCUMENTO
async function garantirUser(userId) {
  let doc = await UserMissions.findOne({ userId });

  if (!doc) {
    doc = await UserMissions.create({
      userId,
      atual: null,
      historico: []
    });
  }

  // garantir estrutura moderna
  if (doc.atual) {
    doc.atual.progresso = {
      platinas: Number(doc.atual.progresso?.platinas) || 0,
      proezas: Number(doc.atual.progresso?.proezas) || 0,
      xp: Number(doc.atual.progresso?.xp) || 0
    };
  }

  return doc;
}

// 🔵 GERAR MISSÃO SEMANAL
export async function gerarMissao(userId) {
  const doc = await garantirUser(userId);

  const missao = MISSOES[Math.floor(Math.random() * MISSOES.length)];

  doc.atual = {
    id: missao.id,
    descricao: missao.descricao,
    objetivo: missao.objetivo,
    progresso: { platinas: 0, proezas: 0, xp: 0 },
    recompensa: missao.recompensa,
    requerJogo: missao.requerJogo || false,
    concluida: false,
    raridade: missao.raridade,
    categoria: missao.categoria,
    dataInicio: new Date().toISOString().split("T")[0]
  };

  await doc.save();
  return doc.atual;
}

// 🔵 ATUALIZAR PROGRESSO
export async function atualizarProgresso(userId, tipo, temJogo) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;

  if (!missao || missao.concluida) return;
  if (missao.requerJogo && !temJogo) return;

  if (tipo === "platina") missao.progresso.platinas++;
  if (tipo === "proeza") missao.progresso.proezas++;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// 🔵 ADICIONAR XP SEMANAL
export async function adicionarXPsemana(userId, quantidade) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;

  if (!missao || missao.concluida) return;

  missao.progresso.xp += quantidade;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// 🔵 VERIFICAR CONCLUSÃO
export async function verificarConclusao(userId) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;
  if (!missao) return;

  const obj = missao.objetivo;
  const prog = missao.progresso;

  const concluida =
    prog.platinas >= obj.platinas &&
    prog.proezas >= obj.proezas &&
    prog.xp >= obj.xp;

  if (!concluida) return;

  missao.concluida = true;
  missao.dataFim = new Date().toISOString().split("T")[0];

  // XP da recompensa
  await adicionarXP(userId, missao.recompensa);

  // mover para histórico
  doc.historico.push(missao);

  // limpar missão atual
  doc.atual = null;

  await doc.save();
  await verificarBadges(userId);

  return true;
}

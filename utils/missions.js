import UserMissions from "../models/UserMissions.js";
import UserStats from "../models/UserStats.js";
import { adicionarXP } from "./xp.js";
import { verificarBadges } from "./badges.js";
import { MISSOES } from "./missionsList.js";

// ===============================
// PROBABILIDADES POR RARIDADE
// ===============================
const PROB_NORMAL = {
  Comum: 60,
  Incomum: 20,
  Rara: 10,
  Épica: 6,
  Lendária: 3,
  Mítica: 0.8,
  Exótica: 0.2,
  Premium: 0
};

const PROB_PREMIUM = {
  Comum: 50,
  Incomum: 20,
  Rara: 12,
  Épica: 8,
  Lendária: 5,
  Mítica: 3,
  Exótica: 1,
  Premium: 1
};

// ===============================
// MULTIPLICADORES DE XP
// ===============================
const MULTIPLICADOR = {
  Comum: 1,
  Incomum: 1.5,
  Rara: 2,
  Épica: 3,
  Lendária: 4,
  Mítica: 6,
  Exótica: 8,
  Premium: 12
};

// ===============================
// ESCOLHER RARIDADE
// ===============================
function escolherRaridade(nivel) {
  const tabela = nivel >= 20 ? PROB_PREMIUM : PROB_NORMAL;

  const total = Object.values(tabela).reduce((a, b) => a + b, 0);
  let sorte = Math.random() * total;

  for (const [raridade, prob] of Object.entries(tabela)) {
    if (sorte < prob) return raridade;
    sorte -= prob;
  }

  return "Comum";
}

// ===============================
// CALCULAR RECOMPENSA XP
// ===============================
function calcularRecompensa(obj, raridade) {
  const base =
    (obj.platinas * 100) +
    (obj.conquistas * 5) +
    (obj.xp * 0.1);

  return Math.floor(base * MULTIPLICADOR[raridade]);
}

// ===============================
// GARANTIR DOCUMENTO
// ===============================
async function garantirUser(userId) {
  let doc = await UserMissions.findOne({ userId });
  if (!doc) {
    doc = await UserMissions.create({ userId, historico: [] });
  }

  if (!doc.atual) return doc;

  doc.atual.progresso = {
    platinas: Number(doc.atual.progresso?.platinas) || 0,
    conquistas: Number(doc.atual.progresso?.conquistas) || 0,
    xp: Number(doc.atual.progresso?.xp) || 0
  };

  return doc;
}

// ===============================
// GERAR MISSÃO PREMIUM INTELIGENTE
// ===============================
export async function gerarMissao(userId) {
  const stats = await UserStats.findOne({ userId });
  const nivel = stats?.nivel || 1;

  const raridadeEscolhida = escolherRaridade(nivel);

  const possiveis = MISSOES.filter(m => m.raridade === raridadeEscolhida);

  const missao = possiveis.length > 0
    ? possiveis[Math.floor(Math.random() * possiveis.length)]
    : MISSOES[Math.floor(Math.random() * MISSOES.length)];

  const recompensaXP = calcularRecompensa(missao.objetivo, missao.raridade);

  const doc = await garantirUser(userId);

  doc.atual = {
    id: missao.id,
    descricao: missao.descricao,
    objetivo: missao.objetivo,
    progresso: { platinas: 0, conquistas: 0, xp: 0 },
    recompensa: recompensaXP,
    requerJogo: missao.requerJogo || false,
    concluida: false,
    raridade: missao.raridade,
    categoria: missao.categoria,
    dataInicio: new Date().toISOString().split("T")[0]
  };

  await doc.save();
  return doc.atual;
}

// ===============================
// ATUALIZAR PROGRESSO
// ===============================
export async function atualizarProgresso(userId, tipo, temJogo) {
  const doc = await garantirUser(userId);
  if (!doc.atual || doc.atual.concluida) return;

  if (doc.atual.requerJogo && !temJogo) return;

  doc.atual.progresso.platinas = Number(doc.atual.progresso.platinas) || 0;
  doc.atual.progresso.conquistas = Number(doc.atual.progresso.conquistas) || 0;

  if (tipo === "platina") doc.atual.progresso.platinas += 1;
  if (tipo === "conquista") doc.atual.progresso.conquistas += 1;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// ===============================
// XP SEMANAL
// ===============================
export async function adicionarXPsemana(userId, quantidade) {
  const doc = await garantirUser(userId);
  if (!doc.atual || doc.atual.concluida) return;

  doc.atual.progresso.xp = Number(doc.atual.progresso.xp) || 0;
  doc.atual.progresso.xp += quantidade;

  await doc.save();
  await verificarConclusao(userId);
  await verificarBadges(userId);
}

// ===============================
// VERIFICAR CONCLUSÃO (ATUALIZADO)
// ===============================
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

  // 🔥 AQUI ESTÁ O QUE FALTAVA 🔥
  doc.ultimaConcluida = missao;

  doc.historico.push(missao);
  doc.atual = null;

  await doc.save();
  await verificarBadges(userId);

  return true;
}

import Mission from "../models/Mission.js";
import { XP_FACIL, XP_MEDIA, XP_DIFICIL, adicionarXP } from "./xp.js";
import { criarBackup } from "./backup.js";
import { verificarBadges } from "./badges.js";
import { MISSOES } from "../data/missoesLista.js"; // mantém a tua lista original

// 🔵 GARANTIR QUE O USER TEM DOCUMENTO
async function garantirUser(userId) {
  let doc = await Mission.findOne({ userId });

  if (!doc) {
    doc = await Mission.create({
      userId,
      atual: null,
      historico: []
    });
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
    progresso: { platinas: 0, conquistas: 0, xp: 0 },
    recompensa: missao.recompensa,
    requerJogo: missao.requerJogo || false,
    concluida: false,
    dataInicio: new Date().toISOString().split("T")[0]
  };

  await doc.save();
  criarBackup();

  return doc.atual;
}

// 🔵 ATUALIZAR PROGRESSO (platina/conquista)
export async function atualizarProgresso(userId, tipo, temJogo) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;

  if (!missao || missao.concluida) return;
  if (missao.requerJogo && !temJogo) return;

  if (tipo === "platina") missao.progresso.platinas++;
  if (tipo === "conquista") missao.progresso.conquistas++;

  await doc.save();
  criarBackup();

  await verificarConclusao(userId);
  verificarBadges(userId);
}

// 🔵 ADICIONAR XP SEMANAL
export async function adicionarXPsemana(userId, quantidade) {
  const doc = await garantirUser(userId);
  const missao = doc.atual;

  if (!missao || missao.concluida) return;

  missao.progresso.xp += quantidade;

  await doc.save();
  criarBackup();

  await verificarConclusao(userId);
  verificarBadges(userId);
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
    prog.conquistas >= obj.conquistas &&
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
  criarBackup();

  verificarBadges(userId);

  return true;
}

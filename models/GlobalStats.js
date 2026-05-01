import GlobalStats from "../models/GlobalStats.js";
import { criarBackup } from "./backup.js";

// 🔵 GARANTIR QUE O DOCUMENTO GLOBAL EXISTE
async function garantirEstrutura() {
  let stats = await GlobalStats.findOne();

  if (!stats) {
    stats = await GlobalStats.create({
      jogos: {},
      plataformas: {}
    });
  }

  return stats;
}

// 🔵 ADICIONAR JOGO
export async function adicionarJogo(nome) {
  if (!nome) return;

  const stats = await garantirEstrutura();

  const atual = stats.jogos.get(nome) || 0;
  stats.jogos.set(nome, atual + 1);

  await stats.save();
  criarBackup();
}

// 🔵 ADICIONAR PLATAFORMA
export async function adicionarPlataforma(nome) {
  if (!nome) return;

  const stats = await garantirEstrutura();

  const atual = stats.plataformas.get(nome) || 0;
  stats.plataformas.set(nome, atual + 1);

  await stats.save();
  criarBackup();
}

// 🔵 REMOVER JOGO
export async function removerJogo(nome) {
  if (!nome) return;

  const stats = await garantirEstrutura();

  const atual = stats.jogos.get(nome);
  if (atual && atual > 0) {
    const novoValor = atual - 1;
    if (novoValor <= 0) {
      stats.jogos.delete(nome);
    } else {
      stats.jogos.set(nome, novoValor);
    }
  }

  await stats.save();
  criarBackup();
}

// 🔵 REMOVER PLATAFORMA
export async function removerPlataforma(nome) {
  if (!nome) return;

  const stats = await garantirEstrutura();

  const atual = stats.plataformas.get(nome);
  if (atual && atual > 0) {
    const novoValor = atual - 1;
    if (novoValor <= 0) {
      stats.plataformas.delete(nome);
    } else {
      stats.plataformas.set(nome, novoValor);
    }
  }

  await stats.save();
  criarBackup();
}

// 🔵 OBTER LISTA DE JOGOS
export async function obterJogos() {
  const stats = await garantirEstrutura();
  return Array.from(stats.jogos.keys());
}

// 🔵 OBTER LISTA DE PLATAFORMAS
export async function obterPlataformas() {
  const stats = await garantirEstrutura();
  return Array.from(stats.plataformas.keys());
}

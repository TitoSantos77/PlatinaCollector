import { readJSON, writeJSON } from "./database.js";

function garantirEstruturaUser(stats, userId) {
  if (!stats[userId]) {
    stats[userId] = {
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    };
  }
}

export function atualizarStatsPlatina(userId, jogo, plataforma) {
  const stats = readJSON("data/userStats.json");

  garantirEstruturaUser(stats, userId);

  stats[userId].platinas++;
  stats[userId].ultimaPlatina = {
    jogo: jogo || "Não especificado",
    plataforma: plataforma || "Não especificado"
  };

  writeJSON("data/userStats.json", stats);
}

export function atualizarStatsConquista(userId, jogo, plataforma) {
  const stats = readJSON("data/userStats.json");

  garantirEstruturaUser(stats, userId);

  stats[userId].conquistas++;
  stats[userId].ultimaConquista = {
    jogo: jogo || "Não especificado",
    plataforma: plataforma || "Não especificado"
  };

  writeJSON("data/userStats.json", stats);
}

export function getUserStats(userId) {
  const stats = readJSON("data/userStats.json");
  if (!stats[userId]) {
    return {
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    };
  }
  return stats[userId];
}

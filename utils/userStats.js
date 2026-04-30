import { readJSON, writeJSON } from "./database.js";

export function atualizarStatsPlatina(userId, jogo, plataforma) {
  const stats = readJSON("data/userStats.json");

  if (!stats[userId]) {
    stats[userId] = {
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    };
  }

  stats[userId].platinas++;
  stats[userId].ultimaPlatina = {
    jogo: jogo || "Não especificado",
    plataforma: plataforma || "Não especificado"
  };

  writeJSON("data/userStats.json", stats);
}

export function atualizarStatsConquista(userId, jogo, plataforma) {
  const stats = readJSON("data/userStats.json");

  if (!stats[userId]) {
    stats[userId] = {
      platinas: 0,
      conquistas: 0,
      ultimaPlatina: null,
      ultimaConquista: null
    };
  }

  stats[userId].conquistas++;
  stats[userId].ultimaConquista = {
    jogo: jogo || "Não especificado",
    plataforma: plataforma || "Não especificado"
  };

  writeJSON("data/userStats.json", stats);
}

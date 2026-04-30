import { readJSON, writeJSON } from "./database.js";

export function adicionarJogo(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");

    if (!stats.jogos) stats.jogos = {};

    if (!stats.jogos[nome]) stats.jogos[nome] = 0;
    stats.jogos[nome]++;

    writeJSON("data/globalStats.json", stats);
}

export function adicionarPlataforma(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");

    if (!stats.plataformas) stats.plataformas = {};

    if (!stats.plataformas[nome]) stats.plataformas[nome] = 0;
    stats.plataformas[nome]++;

    writeJSON("data/globalStats.json", stats);
}

export function obterJogos() {
    const stats = readJSON("data/globalStats.json");
    return Object.keys(stats.jogos || {});
}

export function obterPlataformas() {
    const stats = readJSON("data/globalStats.json");
    return Object.keys(stats.plataformas || {});
}

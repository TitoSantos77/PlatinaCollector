import { readJSON, writeJSON } from "./database.js";
import { criarBackup } from "./backup.js";

function garantirEstrutura(stats) {
    if (!stats.jogos) stats.jogos = {};
    if (!stats.plataformas) stats.plataformas = {};
}

export function adicionarJogo(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    if (!stats.jogos[nome]) stats.jogos[nome] = 0;
    stats.jogos[nome]++;

    writeJSON("data/globalStats.json", stats);
    criarBackup();
}

export function adicionarPlataforma(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    if (!stats.plataformas[nome]) stats.plataformas[nome] = 0;
    stats.plataformas[nome]++;

    writeJSON("data/globalStats.json", stats);
    criarBackup();
}

export function removerJogo(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    if (stats.jogos[nome] && stats.jogos[nome] > 0) {
        stats.jogos[nome]--;
        if (stats.jogos[nome] <= 0) delete stats.jogos[nome];
    }

    writeJSON("data/globalStats.json", stats);
    criarBackup();
}

export function removerPlataforma(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    if (stats.plataformas[nome] && stats.plataformas[nome] > 0) {
        stats.plataformas[nome]--;
        if (stats.plataformas[nome] <= 0) delete stats.plataformas[nome];
    }

    writeJSON("data/globalStats.json", stats);
    criarBackup();
}

export function obterJogos() {
    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    return Object.keys(stats.jogos);
}

export function obterPlataformas() {
    const stats = readJSON("data/globalStats.json");
    garantirEstrutura(stats);

    return Object.keys(stats.plataformas);
}

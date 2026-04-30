const { readJSON, writeJSON } = require("./database");

function adicionarJogo(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");

    if (!stats.jogos[nome]) stats.jogos[nome] = 0;
    stats.jogos[nome]++;

    writeJSON("data/globalStats.json", stats);
}

function adicionarPlataforma(nome) {
    if (!nome) return;

    const stats = readJSON("data/globalStats.json");

    if (!stats.plataformas[nome]) stats.plataformas[nome] = 0;
    stats.plataformas[nome]++;

    writeJSON("data/globalStats.json", stats);
}

function obterJogos() {
    const stats = readJSON("data/globalStats.json");
    return Object.keys(stats.jogos || {});
}

function obterPlataformas() {
    const stats = readJSON("data/globalStats.json");
    return Object.keys(stats.plataformas || {});
}

module.exports = {
    adicionarJogo,
    adicionarPlataforma,
    obterJogos,
    obterPlataformas
};

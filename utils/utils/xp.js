const { readJSON, writeJSON } = require("./database");

// XP base
const XP_PLATINA = 100;
const XP_CONQUISTA = 50;

// XP extra das missões
const XP_FACIL = 20;
const XP_MEDIA = 25;
const XP_DIFICIL = 30;

// XP necessário para subir de nível
function xpNecessario(nivel) {
    return nivel * 100;
}

// Adiciona XP ao user
function adicionarXP(userId, quantidade) {
    const users = readJSON("data/users.json");

    // Se o user não existir, cria-o
    if (!users[userId]) {
        users[userId] = {
            xp: 0,
            nivel: 1,
            totalXP: 0,
            platinas: 0,
            conquistas: 0,
            ultimaPlatina: null,
            ultimaConquista: null
        };
    }

    // Adiciona XP
    users[userId].xp += quantidade;
    users[userId].totalXP += quantidade;

    // Verifica subida de nível
    let xpNeeded = xpNecessario(users[userId].nivel);

    while (users[userId].xp >= xpNeeded) {
        users[userId].xp -= xpNeeded;
        users[userId].nivel++;
        xpNeeded = xpNecessario(users[userId].nivel);
    }

    writeJSON("data/users.json", users);

    return users[userId];
}

module.exports = {
    XP_PLATINA,
    XP_CONQUIISTA: XP_CONQUISTA,
    XP_FACIL,
    XP_MEDIA,
    XP_DIFICIL,
    adicionarXP,
    xpNecessario
};

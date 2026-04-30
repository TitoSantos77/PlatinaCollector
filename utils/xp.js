import { readJSON, writeJSON } from "./database.js";

// XP base
export const XP_PLATINA = 100;
export const XP_CONQUISTA = 50;

// XP extra das missões
export const XP_FACIL = 20;
export const XP_MEDIA = 25;
export const XP_DIFICIL = 30;

// XP necessário para subir de nível
export function xpNecessario(nivel) {
    return nivel * 100;
}

// Adiciona XP ao user
export function adicionarXP(userId, quantidade) {
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

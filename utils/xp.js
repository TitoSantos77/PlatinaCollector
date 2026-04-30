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

// BADGES POR NÍVEL (PORTUGUÊS)
export function getBadgeByLevel(nivel) {
    if (nivel >= 50) return "🟧 Colecionador Eterno";
    if (nivel >= 40) return "🟡 Guardião Supremo";
    if (nivel >= 30) return "🔥 Lenda dos Troféus";
    if (nivel >= 20) return "🟣 Mestre das Platinas";
    if (nivel >= 10) return "🔵 Caçador Experiente";
    if (nivel >= 5)  return "🟢 Caçador Novato";
    return "⚪ Iniciante";
}

// Atualiza badge atual + badges desbloqueadas
function atualizarBadge(user) {
    const novaBadge = getBadgeByLevel(user.nivel);

    if (user.badge !== novaBadge) {
        user.badge = novaBadge;

        // Criar array se não existir
        if (!user.badgesDesbloqueadas) {
            user.badgesDesbloqueadas = [];
        }

        // Adicionar badge se ainda não tiver
        if (!user.badgesDesbloqueadas.includes(novaBadge)) {
            user.badgesDesbloqueadas.push(novaBadge);
        }
    }
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
            ultimaConquista: null,
            badge: "⚪ Iniciante",
            badgesDesbloqueadas: ["⚪ Iniciante"]
        };
    }

    const user = users[userId];

    // Adiciona XP
    user.xp += quantidade;
    user.totalXP += quantidade;

    // Verifica subida de nível
    let xpNeeded = xpNecessario(user.nivel);

    while (user.xp >= xpNeeded) {
        user.xp -= xpNeeded;
        user.nivel++;

        // Atualizar badge ao subir nível
        atualizarBadge(user);

        xpNeeded = xpNecessario(user.nivel);
    }

    writeJSON("data/users.json", users);

    return user;
}

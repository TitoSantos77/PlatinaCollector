function criarBarraProgresso(atual, necessario, tamanho = 30) {
    if (necessario === 0) necessario = 1; // evitar divisão por zero

    const percent = Math.min(100, Math.round((atual / necessario) * 100));
    const blocosPreenchidos = Math.round((percent / 100) * tamanho);
    const blocosVazios = tamanho - blocosPreenchidos;

    const barra =
        "█".repeat(blocosPreenchidos) +
        "░".repeat(blocosVazios);

    return {
        barra,
        percent
    };
}

module.exports = {
    criarBarraProgresso
};

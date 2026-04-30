const fs = require("fs");
const path = require("path");

// Lê um ficheiro JSON e devolve o conteúdo como objeto
function readJSON(filePath) {
    try {
        const fullPath = path.join(__dirname, "..", filePath);
        if (!fs.existsSync(fullPath)) return {};
        const data = fs.readFileSync(fullPath, "utf8");
        return JSON.parse(data || "{}");
    } catch (err) {
        console.error("Erro ao ler JSON:", err);
        return {};
    }
}

// Escreve um objeto num ficheiro JSON
function writeJSON(filePath, data) {
    try {
        const fullPath = path.join(__dirname, "..", filePath);
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), "utf8");
    } catch (err) {
        console.error("Erro ao escrever JSON:", err);
    }
}

module.exports = {
    readJSON,
    writeJSON
};

import fs from "fs";
import path from "path";

function garantirFicheiro(filePath, defaultData = {}) {
  const fullPath = path.join(process.cwd(), filePath);

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(defaultData, null, 2));
  }

  return fullPath;
}

export function readJSON(filePath) {
  const fullPath = garantirFicheiro(filePath, {});

  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeJSON(filePath, data) {
  const fullPath = garantirFicheiro(filePath, {});
  const tempPath = fullPath + ".tmp";

  // Escreve primeiro num ficheiro temporário
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));

  // Substitui o ficheiro original de forma atómica
  fs.renameSync(tempPath, fullPath);
}

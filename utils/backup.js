import fs from "fs";

const DATA_FILES = [
  "data/users.json",
  "data/userStats.json",
  "data/globalStats.json",
  "data/config.json",
  "data/missions.json"
];

export function criarBackup() {
  if (!fs.existsSync("backup")) {
    fs.mkdirSync("backup");
  }

  for (const file of DATA_FILES) {
    if (fs.existsSync(file)) {
      const conteudo = fs.readFileSync(file, "utf8");
      const nome = file.replace("data/", "");

      const tempPath = `backup/${nome}.tmp`;
      const finalPath = `backup/${nome}`;

      // Escreve primeiro num ficheiro temporário
      fs.writeFileSync(tempPath, conteudo);

      // Substitui de forma atómica
      fs.renameSync(tempPath, finalPath);
    }
  }
}

export function restaurarBackup() {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  for (const file of DATA_FILES) {
    const nome = file.replace("data/", "");
    const backupPath = `backup/${nome}`;

    if (fs.existsSync(backupPath) && !fs.existsSync(file)) {
      const conteudo = fs.readFileSync(backupPath, "utf8");

      const tempPath = `${file}.tmp`;

      // Escreve temporário
      fs.writeFileSync(tempPath, conteudo);

      // Move para o ficheiro final
      fs.renameSync(tempPath, file);
    }
  }
}

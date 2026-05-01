import fs from "fs";

const DATA_FILES = [
  "data/users.json",
  "data/userStats.json",
  "data/globalStats.json"
];

export function criarBackup() {
  if (!fs.existsSync("backup")) {
    fs.mkdirSync("backup");
  }

  for (const file of DATA_FILES) {
    if (fs.existsSync(file)) {
      const conteudo = fs.readFileSync(file, "utf8");
      fs.writeFileSync(`backup/${file.replace("data/", "")}`, conteudo);
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
      fs.writeFileSync(file, conteudo);
    }
  }
}

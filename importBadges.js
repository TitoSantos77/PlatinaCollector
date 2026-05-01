import mongoose from "mongoose";
import Badge from "./models/Badge.js";
import fs from "fs";

async function importarBadges() {
  try {
    // 1) Ligar ao MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Ligado ao MongoDB");

    // 2) Ler badges.json antigo
    const raw = fs.readFileSync("data/badges.json", "utf8");
    const badges = JSON.parse(raw);

    // 3) Limpar coleção antiga
    await Badge.deleteMany({});
    console.log("Coleção 'badges' limpa");

    // 4) Inserir badges novas
    await Badge.insertMany(badges);
    console.log("Badges importadas com sucesso!");

    // 5) Fechar ligação
    await mongoose.connection.close();
    console.log("Ligação fechada");
  } catch (err) {
    console.error("Erro ao importar badges:", err);
  }
}

importarBadges();

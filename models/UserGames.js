import mongoose from "mongoose";

const platinaSchema = new mongoose.Schema({
  jogo: String,
  plataforma: String,
  imagem: String,
  data: { type: String, default: () => new Date().toISOString().split("T")[0] },
  xpGanhos: Number
});

const proezaSchema = new mongoose.Schema({
  jogo: String,
  plataforma: String,
  imagem: String,
  data: { type: String, default: () => new Date().toISOString().split("T")[0] },
  xpGanhos: Number
});

// LEGADO — conquistas antigas
const conquistaSchema = new mongoose.Schema({
  nome: String,
  plataforma: String,
  imagem: String,
  data: { type: String, default: () => new Date().toISOString().split("T")[0] },
  xpGanhos: Number
});

// 🟩 NOVO — CARREIRA GTA
const carreiraSchema = new mongoose.Schema({
  categoria: String,
  subcategoria: String,
  plataforma: String,
  jogo: { type: String, default: "Grand Theft Auto V" },
  imagem: String,
  xpGanhos: Number,
  data: String,
  timestamp: { type: Number, default: () => Date.now() }
});

const userGamesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  platinas: { type: [platinaSchema], default: [] },
  proezas: { type: [proezaSchema], default: [] },
  conquistas: { type: [conquistaSchema], default: [] },

  // 🟩 NOVO — CARREIRA GTA
  carreira: { type: [carreiraSchema], default: [] }
});

export default mongoose.model("UserGames", userGamesSchema);

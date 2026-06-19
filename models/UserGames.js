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

const userGamesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  platinas: { type: [platinaSchema], default: [] },
  proezas: { type: [proezaSchema], default: [] }
});

export default mongoose.model("UserGames", userGamesSchema);

import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  platinas: { type: Number, default: 0 },
  conquistas: { type: Number, default: 0 },

  ultimaPlatina: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null }
  },

  ultimaConquista: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null }
  }
});

export default mongoose.model("UserStats", userStatsSchema);

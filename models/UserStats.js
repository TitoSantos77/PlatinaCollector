import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // CONTADORES
  totalPlatinas: { type: Number, default: 0 },
  totalProezas: { type: Number, default: 0 },

  // ÚLTIMAS AÇÕES
  ultimaPlatina: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null },
    imagem: { type: String, default: null },
    data: { type: String, default: null }
  },

  ultimaProeza: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null },
    imagem: { type: String, default: null },
    data: { type: String, default: null }
  },

  // SISTEMA DE XP
  xp: { type: Number, default: 0 },        // XP atual do nível
  totalXP: { type: Number, default: 0 },   // XP acumulado total
  nivel: { type: Number, default: 1 },

  // BADGES
  badgesDesbloqueadas: {
    type: [String],
    default: []
  }
});

export default mongoose.model("UserStats", userStatsSchema);

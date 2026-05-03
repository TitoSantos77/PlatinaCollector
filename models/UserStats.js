import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // CONTADORES
  platinas: { type: Number, default: 0 },
  conquistas: { type: Number, default: 0 },

  // ÚLTIMAS AÇÕES
  ultimaPlatina: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null },
    imagem: { type: String, default: null }
  },

  ultimaConquista: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null },
    imagem: { type: String, default: null }
  },

  // SISTEMA DE XP
  xp: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 },

  // BADGES (CORRIGIDO)
  badgesDesbloqueadas: {
    type: [String],   // IDs das badges
    default: []       // começa vazio
  }
});

export default mongoose.model("UserStats", userStatsSchema);

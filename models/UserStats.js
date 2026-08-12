import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // CONTADORES
  totalPlatinas: { type: Number, default: 0 },
  totalCarreira: { type: Number, default: 0 },

  // ÚLTIMAS AÇÕES
  ultimaPlatina: {
    jogo: { type: String, default: null },
    plataforma: { type: String, default: null },
    imagem: { type: String, default: null },
    data: { type: String, default: null }
  },

  ultimaCarreira: {
    categoria: { type: String, default: null },
    subcategoria: { type: String, default: null },
    plataforma: { type: String, default: null },
    jogo: { type: String, default: "Grand Theft Auto V" },
    imagem: { type: String, default: null },
    data: { type: String, default: null }
  },

  // XP / NÍVEL
  xp: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 }
});

export default mongoose.model("UserStats", userStatsSchema);

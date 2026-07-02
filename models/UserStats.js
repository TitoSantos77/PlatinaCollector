import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // CONTADORES
  totalPlatinas: { type: Number, default: 0 },
  totalProezas: { type: Number, default: 0 },

  // 🟩 NOVO — CARREIRA GTA
  totalCarreira: { type: Number, default: 0 },

  categorias: {
    type: Object,
    default: {}
  },

  subcategorias: {
    type: Object,
    default: {}
  },

  plataformasCarreira: {
    type: Object,
    default: {}
  },

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

  // 🟩 NOVO — ÚLTIMA CARREIRA GTA
  ultimaCarreira: {
    categoria: { type: String, default: null },
    subcategoria: { type: String, default: null },
    plataforma: { type: String, default: null },
    jogo: { type: String, default: "Grand Theft Auto V" },
    imagem: { type: String, default: null },
    data: { type: String, default: null }
  },

  // SISTEMA DE XP
  xp: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 },

  // BADGES
  badgesDesbloqueadas: {
    type: [String],
    default: []
  }
});

export default mongoose.model("UserStats", userStatsSchema);

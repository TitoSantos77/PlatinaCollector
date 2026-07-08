import mongoose from "mongoose";

const globalStatsSchema = new mongoose.Schema({
  // Contagem de jogos (platinas) — FORMATO ANTIGO
  jogos: {
    type: Map,
    of: Number,
    default: {}
  },

  // Contagem de plataformas (platinas) — FORMATO ANTIGO
  plataformas: {
    type: Map,
    of: Number,
    default: {}
  },

  // 🟩 CARREIRA GTA — ARRAYS (NOVO)
  categoriasCarreira: {
    type: [String],
    default: []
  },

  subcategoriasCarreira: {
    type: [String],
    default: []
  },

  plataformasCarreira: {
    type: [String],
    default: []
  }
});

export default mongoose.model("GlobalStats", globalStatsSchema);

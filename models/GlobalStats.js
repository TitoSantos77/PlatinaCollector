import mongoose from "mongoose";

const globalStatsSchema = new mongoose.Schema({
  // Contagem de jogos (platinas)
  jogos: {
    type: [String],
    default: []
  },

  // Contagem de plataformas (platinas)
  plataformas: {
    type: [String],
    default: []
  },

  // 🟩 CARREIRA GTA — ARRAYS (compatível com .push, .filter, etc.)
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

// Documento único
export default mongoose.model("GlobalStats", globalStatsSchema);

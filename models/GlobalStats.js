import mongoose from "mongoose";

const globalStatsSchema = new mongoose.Schema({
  // Contagem de jogos (platinas)
  jogos: {
    type: Map,
    of: Number,
    default: {}
  },

  // Contagem de plataformas (platinas)
  plataformas: {
    type: Map,
    of: Number,
    default: {}
  },

  // 🟩 NOVO — CARREIRA GTA
  categoriasCarreira: {
    type: Map,
    of: Number,
    default: {}
  },

  subcategoriasCarreira: {
    type: Map,
    of: Number,
    default: {}
  },

  plataformasCarreira: {
    type: Map,
    of: Number,
    default: {}
  }
});

// Documento único
export default mongoose.model("GlobalStats", globalStatsSchema);

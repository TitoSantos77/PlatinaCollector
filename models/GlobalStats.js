import mongoose from "mongoose";

const globalStatsSchema = new mongoose.Schema({
  jogos: {
    type: Map,
    of: Number,
    default: {}
  },
  plataformas: {
    type: Map,
    of: Number,
    default: {}
  }
});

// Documento único
export default mongoose.model("GlobalStats", globalStatsSchema);

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

// Só existe UM documento global, por isso usamos um ID fixo
export default mongoose.model("GlobalStats", globalStatsSchema);

import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  descricao: { type: String, required: true },

  objetivo: {
    platinas: { type: Number, default: 0 },
    proezas: { type: Number, default: 0 },
    carreira: { type: Number, default: 0 },
    xp: { type: Number, default: 0 }
  },

  raridade: { type: String, required: true },
  categoria: { type: String, required: true },

  requerJogo: { type: Boolean, default: false }
});

export default mongoose.model("Mission", missionSchema);

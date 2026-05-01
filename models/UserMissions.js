import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  atual: {
    id: String,
    descricao: String,
    objetivo: {
      platinas: Number,
      conquistas: Number,
      xp: Number
    },
    progresso: {
      platinas: { type: Number, default: 0 },
      conquistas: { type: Number, default: 0 },
      xp: { type: Number, default: 0 }
    },
    recompensa: Number,
    requerJogo: { type: Boolean, default: false },
    concluida: { type: Boolean, default: false },
    dataInicio: String,
    dataFim: String
  },

  historico: { type: Array, default: [] }
});

export default mongoose.model("UserMissions", missionSchema);

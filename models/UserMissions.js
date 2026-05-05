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

    // ADICIONADO — porque o gerador premium usa isto
    raridade: String,
    categoria: String,

    dataInicio: String,
    dataFim: String
  },

  // ADICIONADO — o que faltava para o /missoes funcionar
  ultimaConcluida: { type: Object, default: null },

  historico: { type: Array, default: [] }
});

export default mongoose.model("UserMissions", missionSchema);

import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  atual: {
    id: String,
    descricao: String,

    objetivo: {
      platinas: { type: Number, default: 0 },

      // 🟩 NOVO — CARREIRA GTA
      carreira: { type: Number, default: 0 },

      // XP
      xp: { type: Number, default: 0 },

      // 🟨 LEGADO — proezas (não usado, mas mantido para compatibilidade)
      proezas: { type: Number, default: 0 }
    },

    progresso: {
      platinas: { type: Number, default: 0 },

      // 🟩 NOVO — CARREIRA GTA
      carreira: { type: Number, default: 0 },

      // XP
      xp: { type: Number, default: 0 },

      // 🟨 LEGADO — proezas
      proezas: { type: Number, default: 0 }
    },

    recompensa: Number,
    requerJogo: { type: Boolean, default: false },
    concluida: { type: Boolean, default: false },

    raridade: String,
    categoria: String,

    dataInicio: String,
    dataFim: String
  },

  ultimaConcluida: { type: Object, default: null },

  historico: { type: Array, default: [] }
});

export default mongoose.model("UserMissions", missionSchema);

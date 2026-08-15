import mongoose from "mongoose";

const premioSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["xp", "personalizado"], required: true },
  nome: { type: String, required: true },
  quantidade: { type: Number, default: 0 },
  peso: { type: Number, default: 10, min: 1 }
});

const premiosConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  ativo: { type: Boolean, default: false },
  chancePlatina: { type: Number, default: 20, min: 0, max: 100 },
  chanceCarreira: { type: Number, default: 10, min: 0, max: 100 },
  chanceNivel: { type: Number, default: 70, min: 0, max: 100 },
  cooldownSegundos: { type: Number, default: 90, min: 0, max: 600 },
  responsavelId: { type: String, default: null },
  premios: { type: [premioSchema], default: [] }
});

export default mongoose.model("PremiosConfig", premiosConfigSchema);

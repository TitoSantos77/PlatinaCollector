import mongoose from "mongoose";

const premioRegistoSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  tipo: { type: String, enum: ["xp", "personalizado"], required: true },
  nome: { type: String, required: true },
  quantidade: { type: Number, default: 0 },
  gatilho: { type: String, enum: ["platina", "carreira", "nivel"], required: true },
  estado: { type: String, enum: ["pendente", "entregue"], required: true },
  responsavelId: { type: String, default: null },
  criadoEm: { type: Date, default: Date.now },
  entregueEm: { type: Date, default: null },
  entreguePor: { type: String, default: null }
});

export default mongoose.model("PremioRegisto", premioRegistoSchema);

import mongoose from "mongoose";

const premioEventoItemSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ["xp", "personalizado"], required: true },
    nome: { type: String, required: true },
    quantidade: { type: Number, default: 0 },
    peso: { type: Number, default: 10, min: 1 }
  },
  { _id: false }
);

const premioEventoSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  nome: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  criadoPor: { type: String, required: true },
  responsavelId: { type: String, default: null },
  canalId: { type: String, default: null },
  mensagemId: { type: String, default: null },
  criadoEm: { type: Date, default: Date.now },
  terminaEm: { type: Date, required: true },
  encerradoEm: { type: Date, default: null },
  participantes: { type: [String], default: [] },
  premios: { type: [premioEventoItemSchema], default: [] }
});

export default mongoose.model("PremioEvento", premioEventoSchema);

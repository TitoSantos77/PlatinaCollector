import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // Dados básicos do utilizador
  username: { type: String, default: null },
  avatar: { type: String, default: null },

  // Data de criação do perfil
  criadoEm: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

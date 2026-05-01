import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // XP e nível
  xp: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  nivel: { type: Number, default: 1 },

  // Badges
  badge: { type: String, default: "⚪ Iniciante" },
  badgesDesbloqueadas: { type: [String], default: ["⚪ Iniciante"] },

  // Estatísticas (platinas, conquistas)
  platinas: { type: Number, default: 0 },
  conquistas: { type: Number, default: 0 },

  ultimaPlatina: { type: String, default: null },
  ultimaConquista: { type: String, default: null }
});

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const botConfigSchema = new mongoose.Schema({
  chave: { type: String, required: true, unique: true, default: "principal" },
  allowedChannels: { type: [String], default: [] }
});

export default mongoose.model("BotConfig", botConfigSchema);

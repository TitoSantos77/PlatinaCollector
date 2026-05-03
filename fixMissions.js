import mongoose from "mongoose";
import UserMissions from "./models/UserMissions.js";

await mongoose.connect(process.env.MONGO_URI);

const docs = await UserMissions.find({});

for (const doc of docs) {
  if (!doc.atual) continue;

  let changed = false;

  if (isNaN(doc.atual.progresso?.platinas)) {
    doc.atual.progresso.platinas = 0;
    changed = true;
  }

  if (isNaN(doc.atual.progresso?.conquistas)) {
    doc.atual.progresso.conquistas = 0;
    changed = true;
  }

  if (isNaN(doc.atual.progresso?.xp)) {
    doc.atual.progresso.xp = 0;
    changed = true;
  }

  if (changed) {
    console.log(`Corrigido: ${doc.userId}`);
    await doc.save();
  }
}

console.log("Missões corrigidas.");
process.exit();

import mongoose from "mongoose";
import UserGames from "./models/UserGames.js";
import UserStats from "./models/UserStats.js";

const MONGO_URL = process.env.MONGO_URL;

async function rebuild() {
  await mongoose.connect(MONGO_URL);
  console.log("🔵 Ligado ao MongoDB");

  const users = await UserGames.find();

  for (const user of users) {
    const total = user.platinas?.length || 0;

    await UserStats.findOneAndUpdate(
      { userId: user.userId },
      { $set: { totalPlatinas: total } },
      { upsert: true }
    );

    console.log(`➡️ User ${user.userId}: ${total} platinas reconstruídas`);
  }

  console.log("✅ Reconstrução concluída");
  process.exit();
}

rebuild();

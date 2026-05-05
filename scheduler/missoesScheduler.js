import UserStats from "../models/UserStats.js";
import UserMissions from "../models/UserMissions.js";
import { gerarMissao } from "../utils/missions.js";

export function iniciarSchedulerMissoes() {
  console.log("⏱️ Scheduler de missões (Mongo) iniciado...");

  setInterval(async () => {
    try {
      const agora = new Date();

      // Converter UTC → Portugal (UTC+1 no verão)
      const agoraPT = new Date(agora.getTime() + 60 * 60 * 1000);

      const dia = agoraPT.getDay(); // 0=Dom, 1=Seg, 2=Terça
      const hora = agoraPT.getHours();

      // Só corre à terça às 00:00 PT
      if (dia !== 2 || hora !== 0) return;

      console.log("📘 A gerar missões semanais para todos os jogadores...");

      // Buscar todos os users que têm perfil
      const users = await UserStats.find({}, "userId");

      for (const u of users) {
        await gerarMissao(u.userId);
      }

      console.log("✅ Missões semanais geradas com sucesso!");

    } catch (err) {
      console.error("❌ Erro no scheduler de missões:", err);
    }
  }, 60 * 1000); // verifica a cada 1 minuto
}

import { readJSON, writeJSON } from "../utils/database.js";
import { gerarMissao } from "../utils/missions.js";

export function iniciarSchedulerMissoes() {
  console.log("⏱️ Scheduler de missões iniciado...");

  setInterval(() => {
    try {
      const hoje = new Date();
      const diaSemana = hoje.getDay(); // 0=Domingo, 1=Segunda, 2=Terça...

      // Só gera missões à TERÇA-FEIRA
      if (diaSemana !== 2) return;

      const meta = readJSON("data/meta.json") || { ultimaSemanaGerada: null };

      const ano = hoje.getFullYear();
      const semana = obterSemanaDoAno(hoje);
      const chaveSemana = `${ano}-${semana}`;

      // Já gerou esta semana?
      if (meta.ultimaSemanaGerada === chaveSemana) return;

      console.log("📘 A gerar missões semanais para todos os jogadores...");

      const missions = readJSON("data/missions.json");
      const users = readJSON("data/users.json");

      for (const userId of Object.keys(users)) {
        gerarMissao(userId); // função já existente no teu missions.js
      }

      meta.ultimaSemanaGerada = chaveSemana;
      writeJSON("data/meta.json", meta);

      console.log("✅ Missões semanais geradas com sucesso!");

    } catch (err) {
      console.error("❌ Erro no scheduler de missões:", err);
    }
  }, 60 * 60 * 1000); // corre a cada 1 hora
}

// Função auxiliar para calcular semana do ano
function obterSemanaDoAno(data) {
  const inicioAno = new Date(data.getFullYear(), 0, 1);
  const diff = data - inicioAno;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

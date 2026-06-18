import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserStats from "../models/UserStats.js";
import { readJSON } from "../utils/database.js";
import { getUserStats } from "../utils/userStats.js";
import { xpNecessario } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("perfil")
  .setDescription("Mostra o teu perfil de jogador");

export async function execute(interaction) {
  const userId = interaction.user.id;

  // Buscar stats do user no Mongo
  let user = await UserStats.findOne({ userId });

  // Criar se não existir
  if (!user) {
    user = await UserStats.create({
      userId,
      xp: 0,
      totalXP: 0,
      nivel: 1,
      platinas: 0,
      conquistas: 0,
      badgesDesbloqueadas: []
    });
  }

  const badgesDB = readJSON("data/badges.json") || [];

  // ============================
  // 🔵 BADGE PRINCIPAL (CORRIGIDO)
  // ============================
  let badgePrincipal = "Nenhuma";

  if (Array.isArray(user.badgesDesbloqueadas) && user.badgesDesbloqueadas.length > 0) {

    const raridadeOrdem = ["Comum", "Incomum", "Rara", "Épica", "Lendária", "Mítica", "Exótica"];

    // Filtrar badges inválidas e evitar undefined
    const desbloqueadasInfo = user.badgesDesbloqueadas
      .map(id => badgesDB.find(b => b.id === id))
      .filter(b => b && b.nome && b.emoji && b.raridade);

    if (desbloqueadasInfo.length > 0) {
      desbloqueadasInfo.sort(
        (a, b) => raridadeOrdem.indexOf(b.raridade) - raridadeOrdem.indexOf(a.raridade)
      );

      const top = desbloqueadasInfo[0];
      badgePrincipal = `${top.emoji} ${top.nome}`;
    }
  }

  // ============================
  // 🔵 ESTATÍSTICAS DO USER
  // ============================
  const stats = await getUserStats(userId);

  const platinas = stats.platinas ?? 0;
  const conquistas = stats.conquistas ?? 0;

  const ultimaPlatinaTexto = stats.ultimaPlatina?.jogo
    ? `${stats.ultimaPlatina.jogo}${stats.ultima

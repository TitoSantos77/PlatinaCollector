import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { XP_PLATINA, adicionarXP } from "../utils/xp.js";
import { atualizarProgresso } from "../utils/missions.js";
import { adicionarJogo, adicionarPlataforma } from "../utils/globalStats.js";
import { atualizarStatsPlatina } from "../utils/userStats.js";

export const data = new SlashCommandBuilder()
  .setName("platina")
  .setDescription("Gerir platinas")
  .addSubcommand(sub =>
    sub
      .setName("add")
      .setDescription("Adicionar uma platina")
      .addStringOption(opt =>
        opt
          .setName("jogo")
          .setDescription("Nome do jogo")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(opt =>
        opt
          .setName("plataforma")
          .setDescription("Plataforma usada")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addAttachmentOption(opt =>
        opt
          .setName("imagem")
          .setDescription("Prova da platina (screenshot)")
          .setRequired(true)
      )
  );

// 🔵 AUTOCOMPLETE (temporário — depois trocamos para globalStats)
export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);

  if (focused.name === "jogo") {
    const jogos = ["GTA V", "God of War", "Horizon", "Spider-Man", "Elden Ring"];
    const filtrados = jogos
      .filter(j => j.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25);

    return interaction.respond(filtrados.map(j => ({ name: j, value: j })));
  }

  if (focused.name === "plataforma") {
    const plataformas = ["PS4", "PS5", "PC", "Xbox", "Switch"];
    const filtradas = plataformas
      .filter(p => p.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25);

    return interaction.respond(filtradas.map(p => ({ name: p, value: p })));
  }
}

export async function execute(interaction) {
  const jogo = interaction.options.getString("jogo");
  const plataforma = interaction.options.getString("plataforma");
  const imagem = interaction.options.getAttachment("imagem");

  // Segurança: garantir que a imagem é mesmo imagem
  if (!imagem.contentType?.startsWith("image/")) {
    return interaction.reply({
      content: "❌ O ficheiro enviado não é uma imagem válida.",
      ephemeral: true
    });
  }

  // XP ganho (sempre 1 platina)
  const xpGanho = XP_PLATINA;

  // Atualizar XP
  const user = adicionarXP(interaction.user.id, xpGanho);

  // Atualizar missões
  atualizarProgresso(interaction.user.id, "platina", true);

  // Atualizar stats
  adicionarJogo(jogo);
  adicionarPlataforma(plataforma);
  atualizarStatsPlatina(interaction.user.id, jogo, plataforma);

  // Embed final
  const embed = new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle("🏆 Platina adicionada!")
    .setImage(imagem.url)
    .addFields(
      { name: "🎮 Jogo", value: jogo, inline: true },
      { name: "🕹️ Plataforma", value: plataforma, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true },
      { name: "📈 Nível Atual", value: `Nível ${user.nivel} — ${user.xp}/${user.totalXP} XP`, inline: true }
    )
    .setFooter({ text: "Boa! Continua a colecionar platinas!" });

  await interaction.reply({ embeds: [embed] });
}

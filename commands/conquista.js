import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { XP_CONQUISTA, adicionarXP } from "../utils/xp.js";
import { atualizarProgresso } from "../utils/missions.js";
import { adicionarJogo, adicionarPlataforma, obterJogos, obterPlataformas } from "../utils/globalStats.js";
import { atualizarStatsConquista } from "../utils/userStats.js";
import { criarBackup } from "../utils/backup.js";
import { verificarBadges } from "../utils/badges.js";

// LISTA BASE — JOGOS
const jogosBase = [
  "Grand Theft Auto",
  "Grand Theft Auto 2",
  "Grand Theft Auto III",
  "Grand Theft Auto: Vice City",
  "Grand Theft Auto: San Andreas",
  "Grand Theft Auto IV",
  "Grand Theft Auto V",
  "Grand Theft Auto VI",
  "GTA: Liberty City Stories",
  "GTA: Vice City Stories",
  "GTA: Chinatown Wars",
  "GTA Advance",

  "Red Dead Revolver",
  "Red Dead Redemption",
  "Red Dead Redemption: Undead Nightmare",
  "Red Dead Redemption 2",
  "Red Dead Redemption (Remastered)",

  "God of War",
  "God of War Ragnarök",
  "Horizon Zero Dawn",
  "Horizon Forbidden West",
  "Marvel’s Spider-Man",
  "Marvel’s Spider-Man: Miles Morales",
  "Marvel’s Spider-Man 2",
  "The Last of Us Part I",
  "The Last of Us Part II",
  "Ghost of Tsushima",
  "Cyberpunk 2077",
  "The Witcher 3",
  "Assassin’s Creed Valhalla",
  "Assassin’s Creed Odyssey",
  "Assassin’s Creed Mirage",
  "Elden Ring",
  "Fortnite",
  "Apex Legends",
  "Valorant",
  "League of Legends",
  "Rocket League",
  "Minecraft",
  "Gran Turismo 7",
  "Forza Horizon 5",
  "Destiny 2",
  "Overwatch 2",
  "Rainbow Six Siege",
  "PUBG",
  "Warzone",
  "Diablo IV",
  "Hades",
  "Hollow Knight",
  "Stardew Valley",
  "Cuphead",
  "Celeste"
];

// LISTA BASE — PLATAFORMAS
const plataformasBase = [
  "PS4",
  "PS5",
  "Xbox One",
  "Xbox Series X/S",
  "Nintendo Switch",
  "PC"
];

export const data = new SlashCommandBuilder()
  .setName("conquista")
  .setDescription("Gerir conquistas")
  .addSubcommand(sub =>
    sub
      .setName("add")
      .setDescription("Adicionar uma conquista")
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
          .setDescription("Prova da conquista (screenshot)")
          .setRequired(true)
      )
  );

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused(true);

  if (focused.name === "jogo") {
    const aprendidos = obterJogos();
    const lista = [...new Set([...jogosBase, ...aprendidos])]
      .filter(j => j.toLowerCase().includes(focused.value.toLowerCase()))
      .sort()
      .slice(0, 25);

    return interaction.respond(lista.map(j => ({ name: j, value: j })));
  }

  if (focused.name === "plataforma") {
    const aprendidas = obterPlataformas();
    const lista = [...new Set([...plataformasBase, ...aprendidas])]
      .filter(p => p.toLowerCase().includes(focused.value.toLowerCase()))
      .sort()
      .slice(0, 25);

    return interaction.respond(lista.map(p => ({ name: p, value: p })));
  }
}

export async function execute(interaction) {
  const jogo = interaction.options.getString("jogo");
  const plataforma = interaction.options.getString("plataforma");
  const imagem = interaction.options.getAttachment("imagem");

  // Validar imagem
  if (!imagem.contentType?.startsWith("image/")) {
    return interaction.reply({
      content: "❌ O ficheiro enviado não é uma imagem válida.",
      ephemeral: true
    });
  }

  // XP ganho
  const xpGanho = XP_CONQUISTA;

  // Atualizar XP (AGORA COM AWAIT, CARALHO)
  const user = await adicionarXP(interaction.user.id, xpGanho);

  // Atualizar missões
  await atualizarProgresso(interaction.user.id, "conquista", true);

  // Atualizar stats
  adicionarJogo(jogo);
  adicionarPlataforma(plataforma);
  await atualizarStatsConquista(interaction.user.id, jogo, plataforma, imagem.url);

  // Criar backup
  criarBackup();

  // Verificar badges
  await verificarBadges(interaction.user.id);

  // Embed final
  const embed = new EmbedBuilder()
    .setColor("#FFD000")
    .setTitle("🏅 Conquista adicionada!")
    .setImage(imagem.url)
    .addFields(
      { name: "👤 Jogador", value: `${interaction.user}`, inline: false },
      { name: "🎮 Jogo", value: jogo, inline: true },
      { name: "🕹️ Plataforma", value: plataforma, inline: true },
      { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true },
      { name: "📈 Nível Atual", value: `Nível ${user.nivel} — ${user.xp}/${user.totalXP} XP`, inline: true }
    )
    .setFooter({ text: "Boa! Continua a colecionar conquistas!" });

  await interaction.reply({ embeds: [embed] });
}

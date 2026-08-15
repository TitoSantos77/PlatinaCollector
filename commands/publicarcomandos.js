import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("publicarcomandos")
  .setDescription("Publica a lista de comandos úteis do PlatinaCollector")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function criarEmbed() {
  return new EmbedBuilder()
    .setColor("#FFD700")
    .setTitle("📖 Comandos Úteis • PlatinaCollector")
    .setDescription(
      "Aqui tens os principais comandos disponíveis para os membros. " +
      "Usa-os nos canais permitidos pelo bot."
    )
    .addFields(
      {
        name: "🏆 Registar progresso",
        value:
          "**`/platina add`** · Regista uma nova platina com jogo, plataforma e screenshot.\n" +
          "**`/carreira_gta add`** · Regista progresso na Carreira GTA Online com imagem.",
        inline: false
      },
      {
        name: "👤 Perfil e registos",
        value:
          "**`/perfil`** · Mostra o teu perfil de jogador e estatísticas.\n" +
          "**`/nivel`** · Mostra o teu nível atual e progresso de XP.\n" +
          "**`/listar`** · Consulta platinas ou progresso da Carreira GTA de um membro.\n" +
          "**`/editar`** · Corrige uma das tuas próprias platinas ou entradas da Carreira GTA.",
        inline: false
      },
      {
        name: "📊 Rankings e comunidade",
        value:
          "**`/rank`** · Mostra a tua posição no ranking geral de XP.\n" +
          "**`/ranking`** · Mostra o Top 10 do ranking geral.\n" +
          "**`/estatisticas`** · Mostra as estatísticas gerais da comunidade.",
        inline: false
      },
      {
        name: "🎁 Prémios",
        value:
          "**`/premios`** · Consulta os prémios disponíveis, histórico e informações do sistema de sorteios.",
        inline: false
      }
    )
    .setFooter({ text: "PlatinaCollector • Comandos para membros" });
}

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem publicar esta mensagem.",
      ephemeral: true
    });
  }

  try {
    return await interaction.reply({
      embeds: [criarEmbed()]
    });
  } catch (err) {
    console.error("ERRO AO PUBLICAR LISTA DE COMANDOS:", err);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "❌ Não foi possível publicar a lista de comandos.",
        ephemeral: true
      });
    }
  }
}

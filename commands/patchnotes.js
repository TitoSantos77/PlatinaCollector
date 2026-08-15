import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

export const data = new SlashCommandBuilder()
  .setName("patchnotes")
  .setDescription("Publica o Patch Notes mais recente do PlatinaCollector")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function carregarPatchNotes() {
  const caminho = new URL("../data/patchnotes.json", import.meta.url);
  return JSON.parse(fs.readFileSync(caminho, "utf-8"));
}

function listaOuVazio(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return "Nenhuma alteração nesta versão.";
  }

  return lista.map(item => `• ${item}`).join("\n");
}

function formatarBugs(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return "Nenhuma alteração nesta versão.";
  }

  return lista
    .map(item => `**Bug:** ${item.bug}\n**Correção:** ${item.correcao}`)
    .join("\n\n");
}

function criarEmbed(patch) {
  return new EmbedBuilder()
    .setColor("#00A3FF")
    .setTitle(`🛠️ PlatinaCollector • V${patch.versao}`)
    .setDescription(`📅 **${patch.data}**${patch.titulo ? `\n🎯 **${patch.titulo}**` : ""}`)
    .addFields(
      {
        name: "🐞 Correção de Bugs",
        value: formatarBugs(patch.correcaoBugs),
        inline: false
      },
      {
        name: "⚙️ Sistemas",
        value: listaOuVazio(patch.sistemas),
        inline: false
      },
      {
        name: "✨ Novos Sistemas",
        value: listaOuVazio(patch.novosSistemas),
        inline: false
      },
      {
        name: "📝 Conteúdo / Dados",
        value: listaOuVazio(patch.conteudoDados),
        inline: false
      },
      {
        name: "🎨 Interface / Qualidade de Vida",
        value: listaOuVazio(patch.interface),
        inline: false
      },
      {
        name: "📌 Outras Alterações",
        value: listaOuVazio(patch.outras),
        inline: false
      }
    )
    .setFooter({ text: "Patch Notes oficial • PlatinaCollector" });
}

export async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem publicar Patch Notes.",
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const patch = carregarPatchNotes();
    const canal = interaction.channel;

    if (!canal?.isTextBased()) {
      return interaction.editReply("❌ Este comando só pode ser usado num canal de texto.");
    }

    await canal.send({ embeds: [criarEmbed(patch)] });
    return interaction.editReply(`✅ Patch Notes **V${patch.versao}** publicado neste canal.`);
  } catch (err) {
    console.error("ERRO AO PUBLICAR PATCH NOTES:", err);
    return interaction.editReply("❌ Não foi possível publicar o Patch Notes.");
  }
}

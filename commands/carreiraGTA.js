const {
    SlashCommandBuilder,
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require("discord.js");
const fs = require("fs");

// Base de dados local
const DB_PATH = "./carreira.json";

// Carrega ou cria DB
function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 4));
}

// Categorias e subcategorias oficiais PT‑BR
const categorias = {
    "Missões de Contato": [
        "A Safehouse in the Hills",
        "Oscar Guzman Decolando de Novo",
        "Invasão ao Aviário Cluckin’ Bell",
        "A Saideira de Gerald",
        "Retomada Premium Deluxe do Simeon",
        "Serviços de Despache do Madrazo",
        "Lowriders",
        "San Andreas Mercenaries",
        "Operação João e Maria",
        "Vida Super Late",
    ],

    "Esquemas": [
        "Money Fronts",
        "The Chop Shop",
        "Los Santos Drug Wars",
        "The Contract",
        "Night na Balada",
        "Acima da Lei",
        "Importação e Exportação",
        "Loucas Aventuras à Beira da Lei",
        "Motoqueiros",
        "Agents of Sabotage",
        "Bottom Dollar Bounties",
        "Tráfico de Armas",
    ],

    "Golpes": [
        "Golpe de Cayo Perico",
        "Golpe do Cassino Diamond",
        "O Golpe do Juízo Final",
        "Golpes originais",
    ],

    "Lazer": [
        "Los Santos Tuners",
        "Cassino e Resort Diamond",
    ],

    "Modos em Série": [
        "Arena de Guerra",
        "Modos Adversários",
        "Sobrevivências",
        "Corrida",
        "Mata-matas",
    ],

    "Interesses Especiais": [
        "Amante de Veículos",
        "Especialista em Armas",
    ],
};

// Plataformas
const plataformas = ["PS5", "Xbox Series X/S", "PC"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("carreiraGta")
        .setDescription("Gerir o progresso de carreira GTA Online")
        .addSubcommand(sub =>
            sub
                .setName("add")
                .setDescription("Adicionar progresso de carreira")
                .addAttachmentOption(opt =>
                    opt.setName("imagem").setDescription("Imagem obrigatória").setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = loadDB();

        if (sub === "add") {
            const imagem = interaction.options.getAttachment("imagem");

            // 1 — Selecionar categoria
            const categoriaMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("carreira_categoria")
                    .setPlaceholder("Escolhe a categoria")
                    .addOptions(
                        Object.keys(categorias).map(cat => ({
                            label: cat,
                            value: cat,
                        }))
                    )
            );

            await interaction.reply({
                content: "Escolhe a categoria:",
                components: [categoriaMenu],
                ephemeral: true,
            });

            // Collector
            const collector = interaction.channel.createMessageComponentCollector({
                time: 60000,
            });

            let categoriaEscolhida = null;
            let subcategoriaEscolhida = null;
            let plataformaEscolhida = null;

            collector.on("collect", async i => {
                if (i.customId === "carreira_categoria") {
                    categoriaEscolhida = i.values[0];

                    const subMenu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("carreira_subcategoria")
                            .setPlaceholder("Escolhe a subcategoria")
                            .addOptions(
                                categorias[categoriaEscolhida].map(sub => ({
                                    label: sub,
                                    value: sub,
                                }))
                            )
                    );

                    await i.update({
                        content: `Categoria escolhida: **${categoriaEscolhida}**\nAgora escolhe a subcategoria:`,
                        components: [subMenu],
                        ephemeral: true,
                    });
                }

                else if (i.customId === "carreira_subcategoria") {
                    subcategoriaEscolhida = i.values[0];

                    const plataformaMenu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("carreira_plataforma")
                            .setPlaceholder("Escolhe a plataforma")
                            .addOptions(
                                plataformas.map(p => ({
                                    label: p,
                                    value: p,
                                }))
                            )
                    );

                    await i.update({
                        content: `Subcategoria escolhida: **${subcategoriaEscolhida}**\nAgora escolhe a plataforma:`,
                        components: [plataformaMenu],
                        ephemeral: true,
                    });
                }

                else if (i.customId === "carreira_plataforma") {
                    plataformaEscolhida = i.values[0];

                    // Contador por utilizador
                    const userId = interaction.user.id;
                    if (!db[userId]) db[userId] = [];
                    const count = db[userId].length + 1;

                    // Guardar entrada
                    db[userId].push({
                        categoria: categoriaEscolhida,
                        subcategoria: subcategoriaEscolhida,
                        plataforma: plataformaEscolhida,
                        imagem: imagem.url,
                        timestamp: Date.now(),
                    });

                    saveDB(db);

                    // Embed estilo GTA Online
                    const embed = new EmbedBuilder()
                        .setColor("#F5C400")
                        .setTitle(`${categoriaEscolhida} — ${subcategoriaEscolhida}`)
                        .setThumbnail("https://i.imgur.com/2u6hFQv.png") // GTA Online logo
                        .addFields(
                            { name: "Plataforma", value: plataformaEscolhida, inline: true },
                            { name: "Categoria", value: categoriaEscolhida, inline: true },
                            { name: "Subcategoria", value: subcategoriaEscolhida, inline: true },
                        )
                        .setAuthor({
                            name: `${interaction.user.username} completou mais um progresso de carreira no GTA Online`,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setImage(imagem.url)
                        .setFooter({
                            text: `#${count} progresso de carreira (por utilizador)`,
                        });

                    await i.update({
                        content: "",
                        components: [],
                        embeds: [embed],
                        ephemeral: false,
                    });

                    collector.stop();
                }
            });
        }
    },
};

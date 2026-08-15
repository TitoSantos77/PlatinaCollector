import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { criarBackup } from "./utils/backup.js";
import BotConfig from "./models/BotConfig.js";
import * as editar from "./commands/editar.js";
import { handleBackupMenu, handleRestoreMenu } from "./commands/backup.js";

dotenv.config();

// Servidor HTTP para manter o serviço ativo no Render
const app = express();
app.get("/", (req, res) => res.send("PlatinaCollector is running"));
app.listen(process.env.PORT || 10000, () =>
  console.log("Servidor HTTP ativo na porta " + (process.env.PORT || 10000))
);

async function ligarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB conectado!");
  } catch (err) {
    console.error("Erro ao ligar ao MongoDB:", err.message);
  }
}

await ligarMongo();

(async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.commands = new Collection();

  // LOADER DE COMANDOS
  const commandsPath = path.join(process.cwd(), "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(`file://${filePath}`);
    const command = commandModule.default ?? commandModule;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log("Comando mal formatado:", file);
    }
  }

  client.once("ready", async () => {
    console.log("Bot online como " + client.user.tag);

    criarBackup();

    try {
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
      const comandosJSON = client.commands.map(cmd => cmd.data.toJSON());
      const guild = client.guilds.cache.get(process.env.GUILD_ID);

      if (guild) {
        console.log("Modo DEV: Atualizando comandos da guild...");
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
          { body: comandosJSON }
        );
        console.log("Comandos DEV atualizados!");
      } else {
        console.log("Modo PUBLICO: Atualizando comandos globais...");
        await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: comandosJSON }
        );
        console.log("Comandos globais enviados!");
      }
    } catch (err) {
      console.error("Erro ao registar comandos:", err);
    }
  });

  client.on(Events.InteractionCreate, async interaction => {
    console.log("INTERACTION RECEBIDA:", interaction.type);

    // AUTOCOMPLETE
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (command && typeof command.autocomplete === "function") {
        try {
          return await command.autocomplete(interaction);
        } catch (err) {
          console.error("Erro no autocomplete:", err);
        }
      }
      return;
    }

    // BOTÕES
    if (interaction.isButton()) {
      try {
        if (interaction.customId.startsWith("listar_")) {
          const listar = client.commands.get("listar");
          if (typeof listar?.handleButton === "function") {
            return listar.handleButton(interaction);
          }
        }

        if (interaction.customId.startsWith("premios_")) {
          const premios = client.commands.get("premios");
          if (typeof premios?.handleButton === "function") {
            return premios.handleButton(interaction);
          }
        }
      } catch (err) {
        console.error("ERRO NO BOTÃO:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Erro ao processar o botão.",
            ephemeral: true
          });
        }
      }
      return;
    }

    // SELECT MENUS
    if (interaction.isStringSelectMenu()) {
      console.log("SELECT MENU RECEBIDO:", interaction.customId);
      console.log("VALORES:", interaction.values);

      // Tratados pelos collectors dos próprios comandos
      if (interaction.customId.startsWith("carreira_")) return;
      if (interaction.customId === "remover_escolher_item") return;

      try {
        if (interaction.customId.startsWith("premios_")) {
          const premios = client.commands.get("premios");
          if (typeof premios?.handleSelect === "function") {
            return premios.handleSelect(interaction);
          }
        }

        if (interaction.customId === "backup_menu") {
          return handleBackupMenu(interaction);
        }

        if (interaction.customId === "restore_menu") {
          return handleRestoreMenu(interaction);
        }

        if (interaction.customId === "editar_escolher_item") {
          return editar.handleSelect(interaction);
        }

        if (interaction.customId.startsWith("editar_opcao_")) {
          return editar.handleSelectCampo(interaction);
        }
      } catch (err) {
        console.error("ERRO NO SELECT MENU:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Erro ao processar o menu.",
            flags: ["Ephemeral"]
          });
        } else {
          await interaction.editReply({
            content: "❌ Erro ao processar o menu.",
            components: []
          });
        }
      }

      return;
    }

    // USER SELECT MENUS
    if (interaction.isUserSelectMenu()) {
      try {
        if (interaction.customId.startsWith("premios_")) {
          const premios = client.commands.get("premios");
          if (typeof premios?.handleUserSelect === "function") {
            return premios.handleUserSelect(interaction);
          }
        }
      } catch (err) {
        console.error("ERRO NO USER SELECT:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Erro ao processar a seleção de utilizador.",
            ephemeral: true
          });
        }
      }
      return;
    }

    // MODALS
    if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId.startsWith("premios_")) {
          const premios = client.commands.get("premios");
          if (typeof premios?.handleModal === "function") {
            return premios.handleModal(interaction);
          }
        }

        if (interaction.customId.startsWith("editar_modal_")) {
          return editar.handleModal(interaction);
        }
      } catch (err) {
        console.error("ERRO NO MODAL:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Erro ao processar o modal.",
            flags: ["Ephemeral"]
          });
        } else {
          await interaction.editReply({
            content: "❌ Erro ao processar o modal."
          });
        }
      }

      return;
    }

    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        // Comandos administrativos de configuração/publicação ficam acessíveis fora dos canais permitidos.
        const comandosLivres = ["setcanal", "patchnotes", "publicarcomandos"];

        if (!comandosLivres.includes(interaction.commandName)) {
          const config = await BotConfig.findOne({ chave: "principal" }).lean();
          const canaisPermitidos = config?.allowedChannels || [];

          if (canaisPermitidos.length > 0 && !canaisPermitidos.includes(interaction.channelId)) {
            return interaction.reply({
              content: "Este comando só pode ser usado nos canais permitidos.",
              ephemeral: true
            });
          }
        }

        await command.execute(interaction);
      } catch (error) {
        console.error(error);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "Ocorreu um erro ao executar este comando.",
            ephemeral: true
          });
        } else {
          await interaction.followUp({
            content: "Ocorreu um erro ao executar este comando.",
            ephemeral: true
          }).catch(() => {});
        }
      }
    }
  });

  client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    editar.handleImage(message);
  });

  const login = async (tentativa = 0) => {
    try {
      await client.login(process.env.DISCORD_TOKEN);
      console.log("Login efetuado com sucesso!");
    } catch (err) {
      console.error("Erro no login:", err);

      if (tentativa >= 3) {
        console.error("Falha repetida no login. A parar para evitar spam.");
        return;
      }

      const espera = 10000 * (tentativa + 1);
      console.log("A tentar novamente em " + espera / 1000 + "s... (tentativa " + (tentativa + 1) + "/3)");
      setTimeout(() => login(tentativa + 1), espera);
    }
  };

  login();
})();

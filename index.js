import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Fake server para o Render
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("PlatinaCollector is running"));
app.listen(process.env.PORT || 10000, () =>
  console.log("Fake server ativo na porta " + (process.env.PORT || 10000))
);

// MongoDB
import mongoose from "mongoose";

async function ligarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB conectado!");
  } catch (err) {
    console.error("Erro ao ligar ao MongoDB:", err.message);
  }
}

ligarMongo();

// Backup
import { restaurarBackup, criarBackup } from "./utils/backup.js";

// Scheduler
import { iniciarSchedulerMissoes } from "./scheduler/missoesScheduler.js";

// Handlers do /editar
import * as editar from "./commands/editar.js";

// Handlers do /backup
import { handleBackupMenu, handleRestoreMenu } from "./commands/backup.js";

// Handler do /remover  <-- FALTAVA ISTO
import * as remover from "./commands/remover.js";

(async () => {

  restaurarBackup();

  let config = JSON.parse(fs.readFileSync("./data/config.json", "utf8"));

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
    iniciarSchedulerMissoes();

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

  // ============================
  // INTERACTION CREATE (FINAL)
  // ============================
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

    // ============================
    // SELECT MENUS
    // ============================
    if (interaction.isStringSelectMenu()) {

      console.log("SELECT MENU RECEBIDO:", interaction.customId);
      console.log("VALORES:", interaction.values);

      try {

        // /backup
        if (interaction.customId === "backup_menu") {
          return handleBackupMenu(interaction);
        }

        if (interaction.customId === "restore_menu") {
          return handleRestoreMenu(interaction);
        }

        // /remover  <-- AGORA FUNCIONA
        if (interaction.customId === "remover_escolher_item") {
          return remover.handleSelect(interaction);
        }

        // /editar
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

    // ============================
    // MODALS
    // ============================
    if (interaction.isModalSubmit()) {

      try {
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

    // ============================
    // SLASH COMMANDS
    // ============================
    if (interaction.isChatInputCommand()) {

      if (config.allowedChannels && !config.allowedChannels.includes(interaction.channelId)) {
        return interaction.reply({
          content: "Este comando só pode ser usado nos canais permitidos.",
          ephemeral: true
        });
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);

        if (interaction.commandName === "setcanal") {
          config = JSON.parse(fs.readFileSync("./data/config.json", "utf8"));
          criarBackup();
          console.log("Lista de canais atualizada:", config.allowedChannels);
        }

      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Ocorreu um erro ao executar este comando.",
          ephemeral: true
        });
      }
    }
  });

  // ============================
  // MESSAGE CREATE
  // ============================
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

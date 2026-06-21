import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// 🔵 FAKE SERVER PARA O RENDER
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("PlatinaCollector is running"));
app.listen(process.env.PORT || 10000, () =>
  console.log("Fake server ativo na porta " + (process.env.PORT || 10000))
);

// 🔵 MONGODB
import mongoose from "mongoose";

// ===============================
// 🔵 LIGAR AO MONGO
// ===============================
async function ligarMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("📦 MongoDB conectado!");

  } catch (err) {
    console.error("❌ Erro ao ligar ao MongoDB:", err.message);
  }
}

ligarMongo();

// 🔵 IMPORTAR BACKUP
import { restaurarBackup, criarBackup } from "./utils/backup.js";

// IMPORTAR O SCHEDULER
import { iniciarSchedulerMissoes } from "./scheduler/missoesScheduler.js";

// IMPORTAR HANDLERS DO /EDITAR
import * as editar from "./commands/editar.js";

// ===============================
// 🔵 INICIAR BOT (AGORA ASSÍNCRONO)
// ===============================
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

  // ===============================
  // 🔧 LOADER DE COMANDOS (CORRIGIDO)
  // ===============================
  const commandsPath = path.join(process.cwd(), "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(`file://${filePath}`);

    // Se tiver export default, usa-o. Senão, usa o módulo normal.
    const command = commandModule.default ?? commandModule;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`⚠️ O comando ${file} está mal formatado.`);
    }
  }

  // ===============================
  // 🔵 READY
  // ===============================
  client.once("ready", async () => {
    console.log(`Bot online como ${client.user.tag}`);

    criarBackup();
    iniciarSchedulerMissoes();

    try {
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
      const comandosJSON = client.commands.map(cmd => cmd.data.toJSON());

      const guild = client.guilds.cache.get(process.env.GUILD_ID);

      if (guild) {
        console.log("🔧 MODO DEV ATIVO — A atualizar comandos GUILD...");
        await rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
          { body: comandosJSON }
        );
        console.log("✔ Comandos DEV atualizados!");
      } else {
        console.log("🌍 MODO PÚBLICO — A atualizar comandos GLOBAIS...");
        await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: comandosJSON }
        );
        console.log("✔ Comandos globais enviados!");
      }

    } catch (err) {
      console.error("❌ Erro ao registar comandos:", err);
    }
  });

  // ===============================
  // 🔵 INTERAÇÕES
  // ===============================
  client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (command && typeof command.autocomplete === "function") {
        try {
          return await command.autocomplete(interaction);
        } catch (err) {
          console.error("Erro no autocomplete do comando:", err);
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "editar_escolher_item") {
        return editar.handleSelect(interaction);
      }

      if (interaction.customId.startsWith("editar_opcao_")) {
        return editar.handleSelectCampo(interaction);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("editar_modal_")) {
        return editar.handleModal(interaction);
      }
    }

    if (interaction.isChatInputCommand()) {
      if (config.allowedChannels && !config.allowedChannels.includes(interaction.channelId)) {
        return interaction.reply({
          content: "❌ Este comando só pode ser usado nos canais permitidos.",
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
          console.log("✔ Lista de canais atualizada:", config.allowedChannels);
        }

      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "❌ Ocorreu um erro ao executar este comando.",
          ephemeral: true
        });
      }
    }
  });

  // ===============================
  // 🔵 MENSAGENS
  // ===============================
  client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    editar.handleImage(message);
  });

  // ===============================
  // 🔵 LOGIN
  // ===============================
  const login = async (tentativa = 0) => {
    try {
      await client.login(process.env.DISCORD_TOKEN);
      console.log("🔐 Login efetuado com sucesso!");
    } catch (err) {
      console.error("❌ Erro no login:", err);

      if (tentativa >= 3) {
        console.error("❌ Falha repetida no login. A parar para evitar spam

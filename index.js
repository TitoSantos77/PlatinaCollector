import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// 🔵 MONGODB
import mongoose from "mongoose";

// 🔵 LIGAR AO MONGODB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("📦 MongoDB conectado!");
}).catch(err => {
  console.error("❌ Erro ao ligar ao MongoDB:", err);
});

// 🔵 IMPORTAR BACKUP
import { restaurarBackup, criarBackup } from "./utils/backup.js";

// 🔵 RESTAURAR BACKUP ANTES DE LER CONFIG
restaurarBackup();

// IMPORTAR O SCHEDULER
import { iniciarSchedulerMissoes } from "./scheduler/missoesScheduler.js";

// IMPORTAR CONFIG DA PASTA /data (AGORA JÁ RESTAURADA)
let config = JSON.parse(fs.readFileSync("./data/config.json", "utf8"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// Coleção de comandos
client.commands = new Collection();

// Carregar comandos da pasta /commands
const commandsPath = path.join(process.cwd(), "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ O comando ${file} está mal formatado.`);
  }
}

client.once("ready", async () => {
  console.log(`Bot online como ${client.user.tag}`);

  // 🔵 CRIAR BACKUP AO ARRANCAR
  criarBackup();

  // INICIAR O SCHEDULER DE MISSÕES
  iniciarSchedulerMissoes();

  // 🔥 MODO DEV INTELIGENTE
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

// Handler de interações (comandos + autocomplete)
client.on("interactionCreate", async interaction => {

  // 🔵 AUTOCOMPLETE (SUPORTA GLOBAL + POR COMANDO)
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);

    if (command && typeof command.autocomplete === "function") {
      try {
        return await command.autocomplete(interaction);
      } catch (err) {
        console.error("Erro no autocomplete do comando:", err);
      }
    }

    const focused = interaction.options.getFocused();
    const field = interaction.options.getFocused(true).name;

    const { obterJogos, obterPlataformas } = await import("./utils/globalStats.js");

    let lista = [];

    if (field === "jogo") {
      lista = obterJogos();
    } else if (field === "plataforma") {
      lista = obterPlataformas();
    }

    const filtrados = lista
      .filter(item => item.toLowerCase().includes(focused.toLowerCase()))
      .slice(0, 25);

    return interaction.respond(
      filtrados.map(item => ({ name: item, value: item }))
    );
  }

  // 🔵 COMANDOS NORMAIS
  if (!interaction.isChatInputCommand()) return;

  // 🔒 BLOQUEIO DE CANAL (SUPORTA LISTA)
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
});

client.login(process.env.DISCORD_TOKEN);

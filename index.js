import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// IMPORTAR O SCHEDULER
import { iniciarSchedulerMissoes } from "./scheduler/missoesScheduler.js";

// IMPORTAR CONFIG
import config from "./config.json" assert { type: "json" };

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

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);

  // INICIAR O SCHEDULER DE MISSÕES
  iniciarSchedulerMissoes();
});

// Handler de interações (comandos + autocomplete)
client.on("interactionCreate", async interaction => {

  // AUTOCOMPLETE
  if (interaction.isAutocomplete()) {
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

  // COMANDOS NORMAIS
  if (!interaction.isChatInputCommand()) return;

  // 🔒 BLOQUEIO DE CANAL
  if (config.allowedChannel && interaction.channelId !== config.allowedChannel) {
    return interaction.reply({
      content: "❌ Este comando só pode ser usado no canal configurado.",
      ephemeral: true
    });
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);

    // 🔄 RECARREGAR CONFIG SE O /setcanal FOI USADO
    if (interaction.commandName === "setcanal") {
      const newConfig = JSON.parse(fs.readFileSync("./config.json", "utf8"));
      config.allowedChannel = newConfig.allowedChannel;
      console.log("✔ Canal atualizado para:", config.allowedChannel);
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

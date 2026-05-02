import { Events } from "discord.js";
import * as editar from "../commands/editar.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {

    // Ignorar bots
    if (message.author.bot) return;

    // Handler de imagem do /editar
    editar.handleImage(message);
  }
};

import {
  Events,
} from "discord.js";

import * as editar from "../commands/editar.js";
import * as remover from "../commands/remover.js";   // <-- ADICIONADO
import { handleBackupMenu, handleRestoreMenu } from "../commands/backup.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {

    // 1) SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        if (!interaction.replied) {
          interaction.reply({ content: "❌ Erro ao executar o comando.", ephemeral: true });
        }
      }
      return;
    }

    // 2) SELECT MENUS
    if (interaction.isStringSelectMenu()) {

      // Menus do /backup
      if (interaction.customId === "backup_menu") {
        return handleBackupMenu(interaction);
      }

      if (interaction.customId === "restore_menu") {
        return handleRestoreMenu(interaction);
      }

      // Menu do /remover
      if (interaction.customId === "remover_escolher_item") {
        return remover.handleSelect(interaction);   // <-- ADICIONADO
      }

      // Primeiro menu do /editar
      if (interaction.customId === "editar_escolher_item") {
        return editar.handleSelect(interaction);
      }

      // Segundo menu do /editar
      if (interaction.customId.startsWith("editar_opcao_")) {
        return editar.handleSelectCampo(interaction);
      }

      return;
    }

    // 3) MODAL SUBMIT
    if (interaction.isModalSubmit()) {

      if (interaction.customId.startsWith("editar_modal_")) {
        return editar.handleModal(interaction);
      }

      return;
    }
  }
};

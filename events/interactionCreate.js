import { Events } from "discord.js";

import * as editar from "../commands/editar.js";
import * as remover from "../commands/remover.js";
import { handleBackupMenu, handleRestoreMenu } from "../commands/backup.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {

    // ============================
    // 1) SLASH COMMANDS
    // ============================
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error("ERRO NO SLASH:", err);

        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Erro ao executar o comando.",
            flags: ["Ephemeral"]
          });
        } else {
          await interaction.editReply({
            content: "❌ Erro ao executar o comando."
          });
        }
      }
      return;
    }

    // ============================
    // 2) SELECT MENUS
    // ============================
    if (interaction.isStringSelectMenu()) {

      console.log("SELECT MENU RECEBIDO:", interaction.customId);
      console.log("VALORES:", interaction.values);

      try {

        // Menus do /backup
        if (interaction.customId === "backup_menu") {
          return handleBackupMenu(interaction);
        }

        if (interaction.customId === "restore_menu") {
          return handleRestoreMenu(interaction);
        }

        // Menu do /remover
        if (interaction.customId === "remover_escolher_item") {
          return remover.handleSelect(interaction);
        }

        // Primeiro menu do /editar
        if (interaction.customId === "editar_escolher_item") {
          return editar.handleSelect(interaction);
        }

        // Segundo menu do /editar
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
    // 3) MODAL SUBMIT
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
  }
};

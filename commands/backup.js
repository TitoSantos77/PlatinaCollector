import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import fs from "fs";
import path from "path";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("backup")
  .setDescription("Gerir backups (ADMIN).")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator); // 🔒 Só admins

export async function execute(interaction) {
  const backupDir = path.resolve("backup");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Menu principal
  const menu = new StringSelectMenuBuilder()
    .setCustomId("backup_menu")
    .setPlaceholder("Escolhe uma opção…")
    .addOptions([
      {
        label: "Criar Backup",
        value: "criar",
        description: "Guarda todas as estatísticas num novo backup."
      },
      {
        label: "Restaurar Backup",
        value: "restaurar",
        description: "Restaura um backup existente."
      }
    ]);

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({
    content: "📦 **Gestão de Backups**\nEscolhe o que queres fazer:",
    components: [row]
  });
}

// ---------------------- HANDLER DO MENU PRINCIPAL ----------------------

export async function handleBackupMenu(interaction) {
  const backupDir = path.resolve("backup");

  // ---------------------- CRIAR BACKUP ----------------------
  if (interaction.values[0] === "criar") {
    const data = await UserStats.find().lean();

    const now = new Date();
    const dia = String(now.getDate()).padStart(2, "0");
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();
    const hora = String(now.getHours()).padStart(2, "0");

    const fileName = `backup-${dia}-${mes}-${ano}-${hora}h.json`;
    const filePath = path.join(backupDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Limitar a 3 backups
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("backup-"))
      .sort();

    if (files.length > 3) {
      const toDelete = files.slice(0, files.length - 3);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(backupDir, file));
      }
    }

    return interaction.update({
      content: `✅ Backup criado com sucesso!\n📁 Guardado como: **${fileName}**`,
      components: []
    });
  }

  // ---------------------- RESTAURAR BACKUP ----------------------
  if (interaction.values[0] === "restaurar") {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("backup-"))
      .sort();

    if (files.length === 0) {
      return interaction.update({
        content: "❌ Não existem backups para restaurar.",
        components: []
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("restore_menu")
      .setPlaceholder("Escolhe o backup a restaurar…")
      .addOptions(
        files.map(f => ({
          label: f.replace(".json", ""),
          value: f
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.update({
      content: "📂 Escolhe o backup que queres restaurar:",
      components: [row]
    });
  }
}

// ---------------------- HANDLER DO RESTORE ----------------------

export async function handleRestoreMenu(interaction) {
  const backupDir = path.resolve("backup");
  const fileName = interaction.values[0];
  const filePath = path.join(backupDir, fileName);

  if (!fs.existsSync(filePath)) {
    return interaction.update({
      content: "❌ Esse backup já não existe.",
      components: []
    });
  }

  const data = JSON.parse(fs.readFileSync(filePath));

  // Apagar tudo e restaurar
  await UserStats.deleteMany({});
  await UserStats.insertMany(data);

  return interaction.update({
    content: `♻️ Backup **${fileName}** restaurado com sucesso!`,
    components: []
  });
}

// ---------------------- EXPORT DEFAULT (OBRIGATÓRIO!) ----------------------

export default {
  data,
  execute
};

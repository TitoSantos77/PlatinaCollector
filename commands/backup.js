import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import UserStats from "../models/UserStats.js";

export const data = new SlashCommandBuilder()
  .setName("backup")
  .setDescription("Cria um backup manual de todas as estatísticas (ADMIN).")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator); // 🔒 Só admins

export async function execute(interaction) {
  await interaction.reply("📦 A criar backup...");

  const backupDir = path.resolve("backup");

  // Criar pasta se não existir
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Buscar todos os stats
  const data = await UserStats.find().lean();

  // Nome do ficheiro
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  // Guardar backup
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Limite de 3 backups
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith("backup-"))
    .sort(); // mais antigo primeiro

  if (files.length > 3) {
    const toDelete = files.slice(0, files.length - 3);
    for (const file of toDelete) {
      fs.unlinkSync(path.join(backupDir, file));
    }
  }

  return interaction.followUp(`✅ Backup criado com sucesso!\n📁 Guardado como: **${fileName}**`);
}

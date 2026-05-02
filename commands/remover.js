import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("remover")
  .setDescription("Remove platinas ou conquistas de um utilizador (ADMIN)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName("tipo")
      .setDescription("O que queres remover?")
      .setRequired(true)
      .addChoices(
        { name: "Platina", value: "platina" },
        { name: "Conquista", value: "conquista" }
      )
  )
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Utilizador alvo")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName("numero")
      .setDescription("Número da platina/conquista a remover")
  )
  .addStringOption(option =>
    option
      .setName("numeros")
      .setDescription("Lista de números (ex: 2,4,7)")
  )
  .addBooleanOption(option =>
    option
      .setName("tudo")
      .setDescription("Remover TODAS as platinas/conquistas do utilizador")
  );

// Embed final
const embed = new EmbedBuilder()
  .setColor("#FFD000")
  .setTitle("🏅 Conquista adicionada!")
  .setImage(imagem.url)
  .addFields(
    { name: "🎮 Jogo", value: jogo, inline: true },
    { name: "🕹️ Plataforma", value: plataforma, inline: true },
    { name: "✨ XP Ganho", value: `+${xpGanho} XP`, inline: true },
    { name: "📈 Nível Atual", value: `Nível ${user.nivel} — ${user.xp}/${user.totalXP} XP`, inline: true }
  )
  .setFooter({ text: "Boa! Continua a colecionar conquistas!" });

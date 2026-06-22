# 📘 CERBERO — DOCUMENTAÇÃO OFICIAL DO BOT PLATINACOLLECTOR

Este documento descreve **toda a lógica interna** do bot, módulo por módulo, comando por comando, sistema por sistema.

O objetivo é:

- entender o bot sem ler código  
- facilitar manutenção  
- permitir evolução futura  
- garantir consistência  
- evitar bugs  

---

# 🟩 **SECÇÃO 1 — XP Manager (utils/xp.js)**

O sistema de XP controla:

- XP atual  
- XP total  
- XP ganho por ação  
- cálculo de nível  
- badges automáticas por nível  
- loop de subida de nível  

O XP é atualizado por:

- proezas  
- platinas  
- missões  
- comandos administrativos  

O sistema recalcula nível automaticamente sempre que XP muda.

---

# 🟩 **SECÇÃO 2 — UserStats (models/UserStats.js)**

Guarda estatísticas agregadas do jogador:

- userId  
- xp  
- totalXP  
- nivel  
- totalPlatinas  
- totalProezas  
- ultimaPlatina  
- ultimaProeza  
- badgesDesbloqueadas  

É usado pelo /perfil e por todos os sistemas internos.

---

# 🟩 **SECÇÃO 3 — UserGames (models/UserGames.js)**

Guarda o **histórico real** do jogador:

- lista de proezas  
- lista de platinas  
- cada entrada contém:
  - jogo  
  - plataforma  
  - imagem  
  - xpGanhos  

É usado por:

- /proeza add  
- /platina add  
- /editar  
- /perfil  

---

# 🟩 **SECÇÃO 4 — GlobalStats (utils/globalStats.js)**

Guarda estatísticas globais:

- jogos aprendidos  
- plataformas aprendidas  
- autocomplete inteligente  

É atualizado sempre que o user adiciona:

- uma proeza  
- uma platina  

---

# 🟩 **SECÇÃO 5 — Backup System Automático (utils/backup.js)**

Sistema automático:

- cria backups da pasta /data  
- restaura backups no arranque  
- protege contra falhas do Render  
- escrita atómica  

Sistema manual (/backup) é separado.

---

# 🟩 **SECÇÃO 6 — Badges System (utils/badges.js)**

Desbloqueia badges:

- por nível  
- por número de platinas  
- por número de proezas  
- por ações especiais  

Usa badges.json.

---

# 🟩 **SECÇÃO 7 — Sistema de Missões (utils/missions.js)**

Controla:

- missões semanais  
- raridade  
- recompensa XP  
- progresso automático  
- conclusão automática  
- histórico  
- integração com XP  
- integração com badges  

---

# 🟩 **SECÇÃO 8 — /proeza add**

Fluxo:

1. valida imagem  
2. guarda no UserGames  
3. atualiza UserStats  
4. adiciona XP  
5. atualiza missões  
6. atualiza globalstats  
7. verifica badges  
8. backup  
9. embed final (mantido)  
10. adicionada frase “Jogador X adicionou a proeza nº Y”

---

# 🟩 **SECÇÃO 9 — /platina add**

Idêntico ao /proeza add, mas:

- usa XP_PLATINA  
- atualiza ultimaPlatina  
- embed mantido  
- adicionada frase “Jogador X adicionou a platina nº Y”

---

# 🟩 **SECÇÃO 10 — /perfil**

Mostra:

- XP  
- nível  
- barra de progresso  
- platinas  
- proezas  
- última platina  
- última proeza  
- badge principal  
- rebuild automático se stats estiverem vazios  

Corrigido para usar sempre stats atualizados.

---

# 🟩 **SECÇÃO 11 — index.js (Motor do Bot)**

Responsável por:

- servidor fake (Render keep-alive)  
- ligação ao MongoDB  
- restauração de backup  
- carregamento dinâmico de comandos  
- registo de comandos (DEV ou GLOBAL)  
- listeners:
  - autocomplete  
  - select menus  
  - modals  
  - slash commands  
  - mensagens (para /editar)  
- scheduler de missões  
- sistema de login com retry  

É o **cérebro externo** do bot.

---

# 🟩 **SECÇÃO 12 — /backup (Sistema Manual de Backups)**

Permite:

- criar backups manuais  
- restaurar backups manuais  
- listar backups  
- limitar a 3 backups  
- restaurar UserStats diretamente no MongoDB  

Exclusivo para administradores.

---

# 🟩 **SECÇÃO 13 — /editar (Sistema de Edição de Platinas e Proezas)**

Sistema multi‑etapas:

1. /editar → escolher tipo e user  
2. menu → escolher entrada  
3. menu → escolher campo  
4. modal → editar texto  
5. mensagem → editar imagem  

Atualiza:

- UserGames  
- UserStats (última platina/proeza)  

Permissões:

- users editam as suas  
- admins editam qualquer uma  

---

# 🟩 **SECÇÃO 14 — Scheduler de Missões (missoesScheduler.js)**

Corre a cada 1 minuto.  
Gera missões semanais:

- terça-feira  
- 07:00  
- horário de Portugal  

Para todos os utilizadores com UserStats.

---

# 🟩 **SECÇÃO 15 — config.json (Canais Permitidos)**

Controla onde o bot aceita comandos.

Formato atual:

```json
{
  "allowedChannel": null
}
```

Se null → todos os canais permitidos.  
Se lista → só esses canais podem usar comandos.

Atualizado via /setcanal.

---

# 🟩 **SECÇÃO 16 — /listar (Paginação de Platinas e Proezas)**

Lista:

- platinas  
- proezas  

Com:

- paginação  
- botões  
- validação  
- embed limpo  

Mostra 10 entradas por página.

---

# 🟩 **SECÇÃO 17 — Sistema de Missões (utils/missions.js)**

Inclui:

- raridade  
- probabilidade  
- recompensa  
- gerar missão  
- atualizar progresso  
- XP semanal  
- verificar conclusão  
- histórico  
- integração com XP e badges  

É um dos módulos mais avançados do bot.

---

# 🟧 **FIM DA VERSÃO ATUAL DO CERBERO.md**

Este ficheiro cobre:

✔ XP  
✔ Stats  
✔ Jogos  
✔ GlobalStats  
✔ Backup  
✔ Badges  
✔ Missões  
✔ Proeza  
✔ Platina  
✔ Perfil  
✔ Index  
✔ Backup manual  
✔ Editar  
✔ Scheduler  
✔ Config  
✔ Listar  

O bot está praticamente todo documentado.

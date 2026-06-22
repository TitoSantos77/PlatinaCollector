📘 CERBERO — DOCUMENTAÇÃO OFICIAL DO BOT PLATINACOLLECTOR
Este documento descreve toda a lógica interna do bot, módulo por módulo, comando por comando, sistema por sistema.

O objetivo é:

entender o bot sem ler código

facilitar manutenção

permitir evolução futura

garantir consistência

evitar bugs

🟩 SECÇÃO 1 — XP Manager (utils/xp.js)
O sistema de XP controla:

XP atual

XP total

XP ganho por ação

cálculo de nível

badges automáticas por nível

loop de subida de nível

O XP é atualizado por:

proezas

platinas

missões

comandos administrativos

O sistema recalcula nível automaticamente sempre que XP muda.

🟩 SECÇÃO 2 — UserStats (models/UserStats.js)
Guarda estatísticas agregadas do jogador:

userId

xp

totalXP

nivel

totalPlatinas

totalProezas

ultimaPlatina

ultimaProeza

badgesDesbloqueadas

É usado pelo /perfil e por todos os sistemas internos.

🟩 SECÇÃO 3 — UserGames (models/UserGames.js)
Guarda o histórico real do jogador:

lista de proezas

lista de platinas

cada entrada contém:

jogo

plataforma

imagem

xpGanhos

É usado por:

/proeza add

/platina add

/editar

/perfil

🟩 SECÇÃO 4 — GlobalStats (utils/globalStats.js)
Guarda estatísticas globais:

jogos aprendidos

plataformas aprendidas

autocomplete inteligente

É atualizado sempre que o user adiciona:

uma proeza

uma platina

🟩 SECÇÃO 5 — Backup System (utils/backup.js)
Sistema automático:

cria backups da pasta /data

restaura backups no arranque

protege contra falhas do Render

escrita atómica

Sistema manual (/backup) é separado.

🟩 SECÇÃO 6 — Badges System (utils/badges.js)
Desbloqueia badges:

por nível

por número de platinas

por número de proezas

por ações especiais

Usa badges.json.

🟩 SECÇÃO 7 — Missions System (utils/missions.js)
Controla:

missões diárias

missões semanais

progresso

XP extra

reset automático

Integrado com o scheduler.

🟩 SECÇÃO 8 — /proeza add
Fluxo:

valida imagem

guarda no UserGames

atualiza UserStats

adiciona XP

atualiza missões

atualiza globalstats

verifica badges

backup

embed final (mantido)

adicionada frase “Jogador X adicionou a proeza nº Y”

🟩 SECÇÃO 9 — /platina add
Idêntico ao /proeza add, mas:

usa XP_PLATINA

atualiza ultimaPlatina

embed mantido

adicionada frase “Jogador X adicionou a platina nº Y”

🟩 SECÇÃO 10 — /perfil
Mostra:

XP

nível

barra de progresso

platinas

proezas

última platina

última proeza

badge principal

rebuild automático se stats estiverem vazios

Corrigido para usar sempre stats atualizados.

🟩 SECÇÃO 17 — index.js (Motor do Bot)
Responsável por:

servidor fake (Render keep-alive)

ligação ao MongoDB

restauração de backup

carregamento dinâmico de comandos

registo de comandos (DEV ou GLOBAL)

listeners:

autocomplete

select menus

modals

slash commands

mensagens (para /editar)

scheduler de missões

sistema de login com retry

É o cérebro externo do bot.

🟩 SECÇÃO 18 — /backup (Sistema Manual de Backups)
Permite:

criar backups manuais

restaurar backups manuais

listar backups

limitar a 3 backups

restaurar UserStats diretamente no MongoDB

Exclusivo para administradores.

🟩 SECÇÃO 19 — /editar (Sistema de Edição de Platinas e Proezas)
Sistema multi‑etapas:

/editar → escolher tipo e user

menu → escolher entrada

menu → escolher campo

modal → editar texto

mensagem → editar imagem

Atualiza:

UserGames

UserStats (última platina/proeza)

Permissões:

users editam as suas

admins editam qualquer uma

🟩 SECÇÃO 20 — Scheduler de Missões (missoesScheduler.js)
Corre a cada 1 minuto.
Gera missões semanais:

terça-feira

07:00

horário de Portugal

Para todos os utilizadores com UserStats.

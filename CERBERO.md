# CERBERO — PlatinaCollector

Documento técnico resumido da arquitetura atual do bot.

## 1. Núcleo do projeto

O PlatinaCollector trabalha atualmente com dois tipos de registo:

- **Platinas**
- **Carreira GTA Online**

Ambos alimentam o sistema de XP e níveis.

Os antigos sistemas de **badges, missões e proezas** foram removidos do código ativo.

## 2. XP e níveis — `utils/xp.js`

Valores base:

- Platina: **100 XP**
- Carreira GTA: **75 XP**

O XP necessário para subir de nível é calculado por `xpNecessario(nivel)`.

O `UserStats` guarda:

- `xp` — XP dentro do nível atual
- `totalXP` — XP total acumulado
- `nivel` — nível atual

## 3. Histórico — `models/UserGames.js`

Guarda o histórico real de cada utilizador:

### Platinas

- jogo
- plataforma
- imagem
- data
- XP ganho

### Carreira GTA

- categoria
- subcategoria
- plataforma
- jogo
- imagem
- data
- timestamp legado
- XP ganho

## 4. Estatísticas do utilizador — `models/UserStats.js`

Guarda apenas os dados agregados necessários ao bot:

- total de platinas
- total de entradas de Carreira GTA
- última platina
- última entrada de Carreira GTA
- XP atual
- XP total
- nível

## 5. Estatísticas globais — `models/GlobalStats.js` e `utils/globalStats.js`

Guarda os jogos, plataformas e dados de Carreira GTA usados para estatísticas e autocomplete.

## 6. Comandos principais

- `/platina add`
- `/carreira_gta add`
- `/perfil`
- `/nivel`
- `/listar`
- `/editar`
- `/remover`
- `/rank`
- `/ranking`
- `/estatisticas`

## 7. Comandos administrativos

- `/backup`
- `/darxp`
- `/resetall`
- `/setcanal`

Os antigos comandos de `fix`, `rebuild`, badges e missões já não fazem parte da arquitetura ativa.

## 8. `index.js`

Responsável por:

- servidor HTTP para o Render
- ligação ao MongoDB
- carregamento dinâmico dos comandos
- registo dos slash commands
- autocomplete
- menus e modais
- tratamento de mensagens para edição de imagens
- restrição por canais configurados
- retry de login

Não existem schedulers de missões nem rotinas automáticas de reparação no arranque.

## 9. Configuração de canais — `models/BotConfig.js`

Os canais onde o bot pode ser utilizado são guardados de forma persistente no MongoDB.

O `/setcanal` adiciona o ID do canal à lista `allowedChannels` do documento principal de `BotConfig`.

Regras atuais:

- se não existirem canais configurados, o bot pode ser usado em qualquer canal;
- quando existe pelo menos um canal configurado, os restantes comandos só funcionam nesses canais;
- `/setcanal` continua acessível a administradores fora dos canais permitidos, evitando bloquear o acesso à configuração;
- a configuração mantém-se após reinícios e novos deploys do Render.

O antigo `data/config.json` deixou de fazer parte da configuração ativa.

## 10. Backups — `utils/backup.js`

O sistema de backup cria cópias locais dos dados atuais do MongoDB:

- `UserGames`
- `UserStats`
- `GlobalStats`
- `BotConfig`

As coleções MongoDB não são restauradas automaticamente para evitar substituições destrutivas de dados.

## 11. Princípio atual

O fluxo principal do bot é:

**Platinas / Carreira GTA → XP → Nível → Perfil / Rankings / Estatísticas**

A arquitetura deve manter-se simples e evitar sistemas paralelos ou rotinas de reparação permanentes.

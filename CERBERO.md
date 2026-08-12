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

## 9. Configuração de canais

`data/config.json` usa:

```json
{
  "allowedChannels": null
}
```

`null` permite todos os canais. O `/setcanal` cria a lista de canais permitidos quando necessário.

## 10. Backups

`utils/backup.js` guarda cópias locais de:

- `config.json`
- `UserGames`
- `UserStats`
- `GlobalStats`

A restauração automática só recria a configuração local. As coleções MongoDB não são restauradas automaticamente para evitar substituições destrutivas.

## 11. Princípio atual

O fluxo principal do bot é:

**Platinas / Carreira GTA → XP → Nível → Perfil / Rankings / Estatísticas**

A arquitetura deve manter-se simples e evitar sistemas paralelos ou rotinas de reparação permanentes.

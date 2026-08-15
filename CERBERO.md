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

Guarda o histórico real de cada utilizador.

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

## 6. Sistema opcional de prémios

O sistema de prémios é independente do núcleo e fica **desligado por defeito**.

Ficheiros principais:

- `commands/premios.js` — painel e configuração através de `/premios`;
- `models/PremiosConfig.js` — configuração por servidor;
- `models/PremioRegisto.js` — prémios pendentes e histórico;
- `models/PremioEvento.js` — evento atual/último por servidor, participantes e fotografia da tabela de prémios;
- `utils/premios.js` — sorteio, cooldown e entrega;
- `utils/premiosEventos.js` — criação, participação e encerramento dos eventos de prémios.

Tipos de prémio:

- **XP PlatinaCollector** — entrega automática;
- **Prémio personalizado** — entrega manual.

Gatilhos configuráveis:

- nova Platina;
- novo progresso de Carreira GTA;
- subida de nível provocada pelo XP normal de Platina ou Carreira.

O XP recebido como prémio pode subir o nível do utilizador, mas não cria um novo sorteio, evitando ciclos de prémios.

Cada gatilho tem uma chance configurável. Depois de um sorteio bem-sucedido, o prémio é escolhido com base no peso definido para cada opção.

O cooldown é aplicado por utilizador e por servidor entre ações elegíveis. Os gatilhos da mesma ação, por exemplo Platina + subida de nível, podem ser avaliados no mesmo processamento.

### Entrega manual

Os prémios personalizados ficam com estado `pendente` e notificam o responsável configurado.

A mensagem inclui um botão **Marcar como entregue**. Apenas o responsável associado ao prémio pode confirmar a entrega.

Ao confirmar são guardados:

- vencedor;
- prémio;
- responsável;
- data e hora de entrega.

Todos os pendentes permanecem guardados. Entre os prémios entregues são mantidos apenas os **10 mais recentes por servidor**.

### Eventos de Prémios

Os administradores podem abrir `/premios` e usar **Evento** para disparar um evento manual.

Regras:

- o administrador escolhe o nome do evento;
- duração predefinida de **24 horas**, editável entre 1 e 168 horas;
- apenas um evento pode estar ativo por servidor;
- o evento pode funcionar mesmo quando os sorteios normais estão desligados;
- cada membro pode participar uma única vez através do botão público **Receber prémio aleatório**;
- uma participação válida recebe sempre um prémio escolhido pela tabela de pesos;
- o evento guarda no MongoDB os utilizadores que já participaram, sobrevivendo a reinícios do bot;
- o administrador pode consultar o evento atual e encerrá-lo antes do prazo;
- quando o prazo termina, novas participações são recusadas e o botão é desativado quando a mensagem volta a ser processada;
- ao criar o evento é guardada uma fotografia dos prémios e respetivos pesos, evitando alterações das regras a meio do evento;
- o responsável pelos prémios manuais também fica associado ao evento no momento da criação;
- `PremioEvento` reutiliza um único documento por servidor, em vez de acumular um histórico ilimitado de eventos.

Os prémios obtidos por evento usam o mesmo fluxo de entrega e o mesmo histórico dos restantes prémios. `PremioRegisto` identifica estes casos com `gatilho = evento` e guarda também o nome do evento.

### Segurança do núcleo

`/platina` e `/carreira_gta` chamam o sistema de prémios apenas depois de o registo principal estar concluído. Erros no módulo de prémios são isolados e não anulam uma Platina ou progresso de Carreira já registados.

Os Eventos de Prémios são independentes do fluxo de registo de Platinas/Carreira e não usam o cooldown normal.

## 7. Comandos principais

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
- `/premios`

## 8. Comandos administrativos

- `/backup`
- `/darxp`
- `/resetall`
- `/setcanal`

As funções administrativas de `/premios`, incluindo a criação e encerramento de eventos, são validadas dentro do próprio painel.

Os antigos comandos de `fix`, `rebuild`, badges e missões já não fazem parte da arquitetura ativa.

## 9. `index.js`

Responsável por:

- servidor HTTP para o Render;
- ligação ao MongoDB;
- carregamento dinâmico dos comandos;
- registo dos slash commands;
- autocomplete;
- botões, select menus e modais;
- tratamento de mensagens para edição de imagens;
- restrição por canais configurados;
- retry de login.

As interações com prefixo `premios_`, incluindo os botões dos Eventos de Prémios, são encaminhadas para o módulo `/premios`.

Não existem schedulers de missões nem rotinas automáticas de reparação no arranque.

## 10. Configuração de canais — `models/BotConfig.js`

Os canais onde o bot pode ser utilizado são guardados de forma persistente no MongoDB.

O `/setcanal` adiciona o ID do canal à lista `allowedChannels` do documento principal de `BotConfig`.

Regras atuais:

- se não existirem canais configurados, o bot pode ser usado em qualquer canal;
- quando existe pelo menos um canal configurado, os restantes comandos só funcionam nesses canais;
- `/setcanal` continua acessível a administradores fora dos canais permitidos;
- a configuração mantém-se após reinícios e novos deploys do Render.

## 11. Backups — `utils/backup.js`

O sistema de backup cria cópias locais dos dados atuais do MongoDB:

- `UserGames`
- `UserStats`
- `GlobalStats`
- `BotConfig`
- `PremiosConfig`
- `PremioRegisto`
- `PremioEvento`

As coleções MongoDB não são restauradas automaticamente para evitar substituições destrutivas de dados.

Durante um Evento de Prémios não é criado um backup local a cada clique dos participantes. As participações e prémios ficam imediatamente persistidos no MongoDB, evitando concorrência desnecessária nos ficheiros temporários do backup.

## 12. Princípio atual

O fluxo principal do bot continua a ser:

**Platinas / Carreira GTA → XP → Nível → Perfil / Rankings / Estatísticas**

O sistema de prémios é uma camada opcional e não deve tornar-se dependência obrigatória do núcleo.

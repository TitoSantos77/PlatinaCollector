# PlatinaCollector

Bot Discord para registar **platinas** e progresso da **Carreira GTA Online**, com sistema de **XP, níveis, perfil, rankings, estatísticas, edição, remoção, prémios opcionais e backups**.

## Núcleo atual

- `/platina add` — adiciona uma platina com imagem, plataforma, data e XP.
- `/carreira_gta add` — adiciona progresso da Carreira GTA Online.
- `/perfil` e `/nivel` — mostram XP, nível e progresso.
- `/listar` — lista platinas ou entradas da Carreira GTA.
- `/editar` e `/remover` — manutenção dos registos.
- `/rank`, `/ranking` e `/estatisticas` — rankings e estatísticas.
- `/premios` — painel opcional e configurável de prémios.
- `/backup`, `/darxp`, `/resetall` e `/setcanal` — ferramentas administrativas.

## Prémios

O sistema de prémios fica **desligado por defeito** e é configurado por servidor através de `/premios`.

Suporta:

- **XP PlatinaCollector**, entregue automaticamente;
- **prémios personalizados**, entregues manualmente pelo responsável configurado;
- sorteios por **nova Platina**, **Carreira GTA** e **subida de nível**, com chances configuráveis;
- cooldown configurável por utilizador;
- botão para o responsável marcar prémios manuais como entregues;
- todos os prémios pendentes e apenas os **10 últimos prémios entregues** no histórico;
- **Eventos de Prémios** disparados por administradores, com nome personalizado e duração configurável de 24 horas por defeito;
- uma participação por membro em cada evento, através de botão público, com prémio aleatório garantido;
- eventos independentes do estado ligado/desligado dos sorteios normais.

Ao lançar um evento, a lista e os pesos dos prémios ficam congelados para esse evento. Apenas um evento pode estar ativo por servidor e o administrador pode consultá-lo ou encerrá-lo antecipadamente.

Os canais permitidos são configurados com `/setcanal` e guardados de forma persistente no MongoDB, mantendo a configuração após reinícios e novos deploys.

Os antigos sistemas de **badges, missões e proezas** foram removidos do código ativo.

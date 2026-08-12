# PlatinaCollector

Bot Discord para registar **platinas** e progresso da **Carreira GTA Online**, com sistema de **XP, níveis, perfil, rankings, estatísticas, edição, remoção e backups**.

## Núcleo atual

- `/platina add` — adiciona uma platina com imagem, plataforma, data e XP.
- `/carreira_gta add` — adiciona progresso da Carreira GTA Online.
- `/perfil` e `/nivel` — mostram XP, nível e progresso.
- `/listar` — lista platinas ou entradas da Carreira GTA.
- `/editar` e `/remover` — manutenção dos registos.
- `/rank`, `/ranking` e `/estatisticas` — rankings e estatísticas.
- `/backup`, `/darxp`, `/resetall` e `/setcanal` — ferramentas administrativas.

Os canais permitidos são configurados com `/setcanal` e guardados de forma persistente no MongoDB, mantendo a configuração após reinícios e novos deploys.

Os antigos sistemas de **badges, missões e proezas** foram removidos do código ativo.

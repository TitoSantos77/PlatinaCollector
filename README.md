# PlatinaCollector

**Versão atual: V2.1.3**

Bot Discord para registar **platinas** e progresso da **Carreira GTA Online**, com sistema de **XP, níveis, perfil, rankings, estatísticas, edição, remoção, prémios opcionais, eventos e backups**.

## Núcleo atual

- `/platina add` — adiciona uma platina com imagem, plataforma, data e XP.
- `/carreira_gta add` — adiciona progresso da Carreira GTA Online.
- `/perfil` e `/nivel` — mostram XP, nível e progresso.
- `/listar` — lista platinas ou entradas da Carreira GTA.
- `/editar` e `/remover` — manutenção dos registos. O `/remover` preserva XP extra ganho através de prémios, `/darxp` ou outras fontes.
- `/rank`, `/ranking` e `/estatisticas` — rankings e estatísticas.
- `/premios` — painel opcional e configurável de prémios.
- `/patchnotes` — publica o Patch Notes da versão atual.
- `/publicarcomandos` — publica uma mensagem permanente com os principais comandos úteis para os membros.
- `/backup`, `/darxp`, `/resetall` e `/setcanal` — ferramentas administrativas.

## Prémios

O sistema de prémios fica **desligado por defeito** e é configurado por servidor através de `/premios`.

Suporta:

- **XP PlatinaCollector**, entregue automaticamente e integrado no XP total do utilizador;
- **prémios personalizados**, entregues manualmente pelo responsável configurado;
- sorteios por **nova Platina**, **Carreira GTA** e **subida de nível**, com chances configuráveis;
- cooldown configurável por utilizador;
- botão para o responsável marcar prémios manuais como entregues;
- todos os prémios pendentes e apenas os **10 últimos prémios entregues** no histórico;
- **Eventos de Prémios** disparados por administradores, com nome personalizado e duração configurável de 24 horas por defeito;
- uma participação por membro em cada evento, através de botão público, com prémio aleatório garantido;
- eventos independentes do estado ligado/desligado dos sorteios normais.

Ao lançar um evento, a lista e as chances relativas dos prémios ficam congeladas para esse evento. Apenas um evento pode estar ativo por servidor e o administrador pode consultá-lo ou encerrá-lo antecipadamente.

As mensagens dos eventos distinguem o estado atual: **Termina** enquanto o evento está ativo, **Terminou** quando o prazo expira e **Encerrado** quando um administrador o fecha manualmente.

Um Evento de Prémios pode ser disparado num canal diferente do canal habitual do bot. Para publicar corretamente, o PlatinaCollector precisa de ter nesse canal as permissões **Enviar Mensagens** e **Incorporar Links**. Se a publicação falhar, o bot mostra agora um aviso claro ao administrador em vez da mensagem genérica do Discord.

## Canais e publicação

Os canais permitidos são configurados com `/setcanal` e guardados de forma persistente no MongoDB, mantendo a configuração após reinícios e novos deploys.

Os comandos administrativos `/setcanal`, `/patchnotes` e `/publicarcomandos` podem ser usados fora dos canais permitidos para permitir configuração e publicação em canais de informação ou anúncios.

O `/patchnotes` lê a versão atual guardada em `data/patchnotes.json`. Alterar esse ficheiro não modifica mensagens de Patch Notes que já tenham sido publicadas no Discord; apenas futuras publicações usam a nova versão.

## Estado do projeto

Os antigos sistemas de **badges, missões e proezas** foram removidos do código ativo.

A arquitetura técnica resumida do bot está documentada em `CERBERO.md` e o histórico de versões internas em `CHANGELOG_INTERNO.md`.

# PlatinaCollector — Changelog Interno

Este ficheiro regista versões e correções internas do bot. O Patch Notes usado por `/patchnotes` fica em `data/patchnotes.json` e acompanha a versão atual real do bot, mesmo quando uma microversão não é anunciada manualmente à comunidade.

## V2.1.2 — 16/08/2026 — Interna

### 🐞 Correção de Bugs

- **Bug:** depois de um Evento de Prémios terminar, a mensagem continuava a apresentar o campo como `Termina`.
- **Correção:** eventos ativos mostram `Termina`, eventos expirados mostram `Terminou` e eventos fechados manualmente mostram `Encerrado`.

### ⚙️ Sistemas

- Nenhuma alteração.

### ✨ Novos Sistemas

- Nenhuma alteração.

### 📝 Conteúdo / Dados

- Nenhuma alteração.

### 🎨 Interface / Qualidade de Vida

- O estado temporal dos Eventos de Prémios ficou mais claro para os membros.

### 📌 Outras Alterações

- `README.md`, `package.json` e Patch Notes alinhados com a versão V2.1.2.

## V2.1.1 — 15/08/2026 — Interna

### 🐞 Correção de Bugs

- **Bug:** ao usar `/remover`, o XP total era recalculado apenas a partir das Platinas e entradas da Carreira GTA, podendo apagar XP ganho através de prémios, `/darxp` ou outras fontes.
- **Correção:** o `/remover` passou a separar o XP dos registos do XP extra e a preservar todo o XP adicional durante o recálculo.

### ⚙️ Sistemas

- Nenhuma alteração.

### ✨ Novos Sistemas

- Nenhuma alteração.

### 📝 Conteúdo / Dados

- Nenhuma alteração.

### 🎨 Interface / Qualidade de Vida

- O resultado do `/remover` passa a indicar quando existe XP extra preservado.

### 📌 Outras Alterações

- Correção do `/publicarcomandos` para usar uma resposta pública permanente do slash command.

## V2.1.0 — 15/08/2026 — Pública

- Lançamento do Sistema de Prémios e Eventos de Prémios.
- Correção da navegação do `/listar`.
- Correção de conteúdo em Missões de Contacto.
- Melhorias de navegação e clareza no `/premios`.

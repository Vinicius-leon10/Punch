# Instalar o LONA no iPhone

O LONA é um app web instalável: depois de instalado, abre pelo ícone na tela de início, em tela cheia, e funciona sem internet.

## 1. Publicar o jogo no GitHub Pages (uma vez só)

O link do jogo é **https://vinicius-leon10.github.io/Punch/**. Para ele funcionar:

1. No GitHub, abra o repositório **Punch → Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Abra a aba **Actions**, toque em **Publicar jogo (GitHub Pages)** → **Run workflow** (ou espere o próximo envio para a branch).
4. Em 1 ou 2 minutos o link abre o jogo.

Se a publicação falhar com a mensagem *"Branch ... is not allowed to deploy to github-pages"*: em **Settings → Environments → github-pages → Deployment branches**, adicione `claude/new-session-3yuxoc` (ou faça o merge na `main`, que já é permitida).

Cada envio para a branch (ou para a `main`) publica a versão nova sozinho.

## 2. Instalar no iPhone

1. Abra o link no **Safari** (precisa ser o Safari).
2. Toque em **Compartilhar** (quadrado com a seta para cima).
3. Role e toque em **Adicionar à Tela de Início** → **Adicionar**.
4. Abra o LONA pelo ícone da luva na tela de início.

## Bom saber

- **Atualizações:** abra o app com internet; a versão nova entra na próxima vez que você abrir.
- **Sem internet:** depois da primeira abertura, o jogo inteiro fica guardado no aparelho.
- **Progresso:** fica salvo no iPhone, dentro do app. Se apagar o ícone, o progresso vai junto. O link aberto no Safari e o app instalado têm saves separados.
- **Modo teste:** a engrenagem ⚙ no topo avança o relógio e apaga o personagem.

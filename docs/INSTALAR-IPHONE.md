# Instalar o LONA no iPhone

O LONA é um app web instalável: depois de instalado, abre pelo ícone na tela de início, em tela cheia, e funciona sem internet.

## 1. Publicar o jogo na Netlify (uma vez só)

1. Entre em **app.netlify.com** e crie uma conta grátis (dá para entrar com o GitHub).
2. Toque em **Add new site → Import an existing project → GitHub**.
3. Autorize a Netlify a ver o repositório **Vinicius-leon10/Punch** (pode deixar só esse).
4. Em **Branch to deploy**, escolha `claude/new-session-3yuxoc` (depois do merge, troque para `main`).
5. Os outros campos já vêm do arquivo `netlify.toml` (build `npm ci && npm run build`, pasta `dist`). Toque em **Deploy**.
6. Em 1 ou 2 minutos aparece o link, algo como `https://nome-aleatorio.netlify.app`. Em **Site configuration → Change site name** dá para trocar para `lona-jogo.netlify.app`, se estiver livre.

Cada vez que o jogo for atualizado na branch, a Netlify publica a nova versão sozinha.

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

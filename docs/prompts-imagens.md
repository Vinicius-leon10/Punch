# Punch: prompts de imagens

Pacote de prompts para gerar as artes do jogo de luta em modo carreira.
Todos os personagens são originais.

---

## 0. Bloco de estilo (cole no começo de todo prompt, no lugar de `[ESTILO]`)

```
Estilo: ilustração 2D de jogo de luta, cartoon semi-realista, traço grosso e limpo,
cel shading com 3 tons, cores saturadas, iluminação dramática de ringue com luz de cima,
proporções levemente exageradas (ombros e punhos grandes), visual consistente de game asset.
```

**Negative prompt** (se a ferramenta aceitar):

```
texto, marca d'água, logotipo, dedos extras, mãos deformadas, rosto distorcido,
borrado, fotorrealista, 3D render, fundo poluído, marcas reais, personagens existentes
```

**Alternativa pixel art** (troque o bloco de estilo por este):

```
pixel art 64x64 por personagem, paleta limitada de 32 cores, sem anti-aliasing, visão lateral
```

---

## 1. Protagonista

### 1a. Ficha de personagem (frente, perfil e costas)

```
[ESTILO] Ficha de personagem de um boxeador jovem de 20 anos, peso médio, cabelo curto
cacheado, faixa branca na testa, shorts azul-marinho com listra dourada, luvas vermelhas
gastas, bandagem nos punhos, expressão determinada. Três vistas lado a lado: frente,
perfil e costas, pose neutra em T suave, fundo branco liso, corpo inteiro.
```

### 1b. Evolução na carreira (3 fases)

```
[ESTILO] O mesmo boxeador em três fases da carreira lado a lado: (1) iniciante com
roupa simples de academia de bairro, (2) profissional com shorts de cetim e patrocínio
genérico, (3) campeão com cinturão dourado no ombro e roupão vermelho e dourado.
Corpo inteiro, fundo branco, mesma iluminação.
```

---

## 2. Rivais

### 2a. "Tanque" Ribeiro

```
[ESTILO] Retrato de corpo inteiro de um boxeador peso-pesado careca e barbudo, tatuagem
tribal no braço, shorts verdes, aparência lenta e muito forte, pose de guarda de boxe,
fundo branco, olhando levemente para a esquerda.
```

### 2b. Kenji Sora

```
[ESTILO] Retrato de corpo inteiro de um boxeador peso-leve ágil, cabelo em rabo de cavalo,
shorts brancos com estampa de onda azul, postura de esquiva, pose de guarda de boxe,
fundo branco, olhando levemente para a esquerda.
```

### 2c. Dimitri Volk

```
[ESTILO] Retrato de corpo inteiro de um boxeador veterano alto de 40 anos, cicatriz no
supercílio, shorts cinza-escuro, olhar frio e calculista, pose de guarda de boxe,
fundo branco, olhando levemente para a esquerda.
```

### 2d. "Furacão" Mendes

```
[ESTILO] Retrato de corpo inteiro de uma boxeadora agressiva com cabelo trançado,
shorts roxo e laranja, sorriso provocador, pose de guarda de boxe ofensiva,
fundo branco, olhando levemente para a esquerda.
```

### 2e. El Martillo

```
[ESTILO] Retrato de corpo inteiro de um boxeador showman de bigode, shorts vermelhos com
franjas, máscara de tecido pendurada no pescoço, pose de guarda de boxe confiante,
fundo branco, olhando levemente para a esquerda.
```

---

## 3. Cenários (16:9, sem personagens)

### 3a. Academia de bairro

```
[ESTILO] Cenário de fundo para jogo de luta 2D, visão lateral, formato 16:9, sem personagens,
ringue centralizado na metade inferior: galpão velho com goteira, sacos de pancada
remendados, luz fluorescente fria, ringue pequeno com cordas desbotadas.
```

### 3b. Ginásio regional

```
[ESTILO] Cenário de fundo para jogo de luta 2D, visão lateral, formato 16:9, sem personagens,
ringue centralizado na metade inferior: ginásio com arquibancada de madeira meio cheia,
faixas coloridas penduradas, iluminação quente.
```

### 3c. Arena nacional

```
[ESTILO] Cenário de fundo para jogo de luta 2D, visão lateral, formato 16:9, sem personagens,
ringue centralizado na metade inferior: estádio coberto lotado, telões, holofotes azuis
e brancos, fumaça no ar.
```

### 3d. Disputa de título mundial

```
[ESTILO] Cenário de fundo para jogo de luta 2D, visão lateral, formato 16:9, sem personagens,
ringue centralizado na metade inferior: arena gigante à noite, plateia como um mar de luzes
de celular, pirotecnia dourada.
```

---

## 4. Telas e interface

### 4a. Tela de título

```
[ESTILO] Arte de tela de título de jogo de boxe, o protagonista em primeiro plano batendo
os punhos, ringue iluminado ao fundo, espaço vazio no topo para o logotipo, formato 16:9.
```

### 4b. Fundo do menu da carreira

```
[ESTILO] Fundo de menu de modo carreira: vestiário com armários, banco de madeira, luvas
penduradas, quadro de cortiça com recortes de jornal e calendário de lutas, luz suave e
desfocada, área escura à esquerda para os botões. Formato 16:9.
```

### 4c. Retratos para a tela "VS" (um por personagem)

```
[ESTILO] Retrato do busto de [PERSONAGEM] em ângulo 3/4 olhando para o lado, expressão
intensa, iluminação lateral forte em vermelho, fundo branco liso.
```

### 4d. Ícones do HUD e do treino

```
[ESTILO] Conjunto de ícones de jogo em grade 4x2, fundo branco liso, contorno grosso:
luva de boxe, raio (energia), coração (vida), halter (força), tênis (velocidade),
escudo (defesa), cinturão de campeão, troféu.
```

---

## 5. Sprites e animação

### 5a. Sprite sheet do protagonista

```
[ESTILO] Sprite sheet do boxeador protagonista em visão lateral, fundo branco liso,
mesmo tamanho e alinhamento em todos os quadros, 8 poses em linha: guarda, jab,
direto, gancho, uppercut, esquiva, bloqueio, nocauteado no chão.
```

> Geradores de imagem raramente mantêm a consistência entre quadros de animação.
> Use estas imagens como referência e finalize os sprites num editor (Aseprite, Krita).

---

## Dicas

- Gere primeiro a **ficha do protagonista (1a)** e use essa imagem como referência
  (image-to-image ou "character reference") em todos os outros prompts. Isso mantém o
  mesmo rosto e as mesmas cores.
- No Midjourney, acrescente `--ar 16:9` nos cenários e telas, e `--cref <url da ficha>`
  para manter o personagem.
- Peça fundo branco liso e remova o fundo depois para ter PNG transparente.

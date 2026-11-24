# LONA — Guia de arte com IA

O objetivo é ter o **clima do gênero** (pixel art, cidade, luta de rua que vira carreira) com **identidade própria**.
Não usar personagens, cenários ou telas de outros jogos como referência direta nos prompts (nada de "no estilo de Punch Club"),
nem enviar imagens de outros jogos para a IA copiar. Isso protege o projeto de problemas de direitos autorais.

## 1. Ferramentas sugeridas

| Ferramenta | Para quê | Observação |
|---|---|---|
| **PixelLab** (pixellab.ai) | Sprites de personagem, animações (andar, socar, chutar), itens | Feito para pixel art de jogo; gera com fundo transparente e em vários ângulos |
| **Leonardo.ai** / **Scenario** | Cenários, telas de fundo, ícones | Treine um "modelo de estilo" com as primeiras artes aprovadas para manter consistência |
| **Aseprite** (US$ 20, uma vez) | Limpar e ajustar a arte gerada, montar animações | Quase toda arte de IA precisa de retoque: pixels soltos, cores fora da paleta |

Antes de usar no jogo, confira nos termos de cada ferramenta se o plano permite **uso comercial**.

## 2. Bíblia de estilo (colar no começo de todo prompt)

```
pixel art, 2D side view, crisp pixels, no anti-aliasing, 1px dark outline (#140e1c),
limited palette (night navy #0c0e1d, brick #4a2630, sodium lamp orange #ffa043,
neon pink #ff4f8b, pool teal #2de2c4, gold #ffd23f), Brazilian urban night setting,
gritty but colorful, transparent background
```

Regras para manter tudo coerente:
- **Tamanho dos lutadores:** 64×64 px por quadro (o protótipo usa 48×48). Cenários em 384×216 (16:9), ampliados 4×–5× na tela.
- **Luz:** sempre vinda de cima à direita (poste/holofote). Sombra do lado esquerdo.
- **Contorno escuro** em todos os personagens e objetos.
- **Mesma paleta** em tudo. Se a IA sair do tom, corrija no Aseprite com "Indexed color" usando a paleta acima.

## 3. Lista de artes, por ordem de prioridade

### Fase A: o que mais muda a cara do jogo
1. **Lutador base** (corpo masculino e feminino), parado em guarda, vista lateral, 64×64.
   > `[bíblia] fighter character, side view facing right, fighting stance with raised fists, bare chest, athletic build, short shorts, hand wraps, idle pose, 64x64 sprite`
2. **Animações do lutador** (4–6 quadros cada): guarda (respirando), soco, chute, levar golpe, nocaute (cair), comemorar.
3. **Rua da tela principal** (fundo do menu): academia de garagem com letreiro neon, muro de tijolo, poste, calçada.
   > `[bíblia] side-scrolling background, night street in a Brazilian city, small boxing gym in a garage with half-open metal door and warm light inside, pink neon sign, brick wall, street lamp, sidewalk, 384x216`
4. **Arena** (fundo da luta): ringue clandestino com público na penumbra e holofotes.

### Fase B: personalização e itens
5. Cabelos (careca, curto, moicano, black power, trança, rabo), barbas, tatuagens, em camadas separadas para combinar.
6. Luvas, shorts e protetores: 4 raridades de cada (comum, raro, épico, lendário), como ícone 32×32 e como peça no corpo.
7. Ícones do menu em 16×16 (treinar, lutar, mestres, lutador, casa, loja, missões, VIP, energia, comida, moeda, ouro).

### Fase C: lugares e pessoas
8. Interior da academia com os 5 aparelhos (saco, corda, abdominal, sparring, esteira) e animação do lutador usando cada um.
9. Casa (quarto simples, cama, geladeira).
10. Os 4 mestres, um por arte, com visual marcante (retrato 96×96 e sprite).
11. Logo do jogo em pixel art.

## 4. Fluxo de trabalho

1. Gere de **4 a 8 variações** de cada peça e escolha a melhor.
2. Retoque no Aseprite (paleta, contorno, pixels soltos).
3. Exporte em **PNG com fundo transparente**. Animações em folha de sprites: quadros lado a lado, mesmo tamanho.
4. Me mande os arquivos (ou coloque na pasta `art/` do repositório) e eu encaixo no jogo no lugar da arte provisória.
5. Quando houver umas 10 peças aprovadas, use-as para treinar um modelo de estilo (Leonardo/Scenario). Assim as próximas saem no mesmo estilo.

## 5. Como a arte entra no código

Hoje os bonecos e cenários são desenhados por código (`src/ui/sprite.ts` e `src/ui/scene.ts`).
Quando chegarem os PNGs, a troca é feita só nesses dois arquivos: as regras do jogo não mudam.
A troca pode ser feita peça por peça. Por exemplo, primeiro só o cenário da rua, mantendo os bonecos provisórios.

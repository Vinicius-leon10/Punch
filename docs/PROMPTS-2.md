# LONA — Prompts, rodada 2

Revisão das 20 primeiras imagens (pasta `art/v1`) e prompts do que falta, em ordem de prioridade.

## Como ficou a rodada 1

| # | Imagem | Situação |
|---|---|---|
| 01, 02, 03 | Protagonistas | ✅ Aprovados. O 01 e o 03 são claramente a mesma pessoa. |
| 04 | Folha de animações | ⚠️ Faltam quadros: o soco e o chute aparecem em 1 quadro só, e os quadros estão fora de uma grade. Refazer (prompts A1–A4). |
| 05–08 | Mestres | ✅ Aprovados. |
| 09 | Retratos dos mestres | ❌ Não batem com os bonecos: a Carla está de kimono preto, o Somchai de camiseta e o Bimbinha virou uma mulher de kimono verde. Refazer um por um (prompt C1). |
| 10, 12, 13 | Dona Neide, lanchonete, rival | ✅ Aprovados. |
| 11 | Dono da loja | ✅ Serve para a tela da loja (veio com fundo de parede, mas tudo bem). |
| 14 | Oponentes | ❌ Os 8 estão encostados uns nos outros e não dá para separar. Refazer com espaço entre eles (prompt B2). |
| 15, 16, 17 | Rua, academia, CT | ✅ Aprovados. No 17, as faixas da parede têm símbolos sem sentido; dá para usar assim. |
| 18 | Casa | ⚠️ Os cartazes têm letras erradas ("LONAA", "SLEAAR"). Refazer sem texto (D2). |
| 19 | Loja | ⚠️ O neon diz "OPEN"; melhor "ABERTO" (D3). |
| 20 | Ringue | ⚠️ Tem um lutador desenhado dentro do ringue, e os nossos lutadores vão ficar ali. Refazer vazio e de lado (D1). |

## Dica que vale para tudo
Sempre que a ferramenta deixar, **envie a imagem aprovada como referência**: o 01 para o lutador e o 05–08 para os mestres.
É isso que mantém o mesmo personagem em todas as imagens. Para animações, o **PixelLab** é o mais indicado: ele anima a partir de um personagem pronto.

Estilo fixo (já está incluído em todos os prompts abaixo):
`2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette`

---

## A. Animações do lutador (prioridade máxima)

Faça **cada animação numa imagem separada**: dá muito mais certo do que uma folha gigante.
Use o 01 (homem) como referência. Depois repita tudo com o 02 (mulher), trocando `male` por `female`.

**A1. Golpes de soco (boxe)**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), side view facing right, ONE ROW of 6 frames on a strict grid, every frame the same size, character the same size in every frame, feet on the same baseline, equal empty space between frames, frames not touching: jab punch from guard to full arm extension and back to guard, transparent background
```
Repita trocando o final por:
- `straight right cross punch with body rotation` (direto)
- `left hook punch` (gancho)
- `uppercut punch from below` (uppercut)
- `quick side dodge, upper body leaning away and returning` (esquiva)

**A2. Chutes e joelhadas (muay thai)**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image, side view facing right, ONE ROW of 6 frames on a strict grid, every frame the same size, feet on the same baseline, equal empty space between frames, frames not touching: muay thai low kick to the thigh, chamber, impact, return to guard, transparent background
```
Repita com: `high roundhouse kick to the head` (chute alto), `knee strike while holding opponent's neck` (joelhada), `elbow strike` (cotovelada), `blocking a kick by lifting the shin` (bloqueio de canela).

**A3. Jiu-jitsu**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image, side view facing right, ONE ROW of 6 frames on a strict grid, every frame the same size, equal empty space between frames, frames not touching: double leg takedown, lowering the body and shooting forward, transparent background
```
Repita com: `punching down from top mount position` (socos na montada), `applying an armbar on the ground` (chave de braço), `rear naked choke` (mata-leão).

**A4. Capoeira**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image, side view facing right, ONE ROW of 6 frames on a strict grid, every frame the same size, feet on the same baseline, equal empty space between frames, frames not touching: capoeira ginga swaying movement, loop, transparent background
```
Repita com: `meia lua de frente crescent kick`, `armada spinning back kick`, `rasteira low sweep`, `martelo side kick to the head`, `au cartwheel`.

**A5. Reações**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image, side view facing right, ONE ROW of 6 frames on a strict grid, every frame the same size, feet on the same baseline, equal empty space between frames, frames not touching: getting punched in the face, head snapping back, stumbling and recovering guard, transparent background
```
Repita com: `knocked out, falling backwards to the floor and lying still` (nocaute, 8 quadros), `victory celebration raising one fist` (vitória), `idle fighting stance breathing loop, 4 frames` (parado).

## B. Personalização e oponentes

**B1. Corpos base (para trocar cor de pele, short e luva por código)**
```
2D pixel art character lineup, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, 6 street fighters in the same fighting stance facing right, each in its own cell of a 3x2 grid with empty space between them, not touching: skinny young man, muscular man, heavy big man, slim woman, muscular woman, older bearded man, all wearing plain light gray shorts and plain white hand wraps, transparent background
```

**B2. Oponentes separados**
```
2D pixel art character lineup, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, 8 different street fighters facing left in fighting stance, each in its own cell of a 4x2 grid, wide empty space between them, characters NOT touching or overlapping, varied body types, skin tones, hairstyles, tattoos and shorts colors, transparent background
```

**B3. Cabelos e barbas (peças soltas)**
```
2D pixel art hairstyle set, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, 12 separate hairstyles seen from the side facing right, each in its own cell of a 4x3 grid with empty space, no face, only hair: buzz cut, messy short hair, mohawk, afro, braids, dreadlocks, ponytail, bun, long straight hair, curly short hair, bald with stubble, slicked back, transparent background
```

## C. Retratos (telas de conversa)

**C1. Retrato de cada mestre (um por vez, com o boneco como referência)**
```
2D pixel art portrait, front-facing bust, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, exactly the same character as the reference image, same clothes and same hair, expressive face, simple dark background, square
```
Envie como referência o 05, o 06, o 07 e o 08, um de cada vez. Faça o mesmo para o 01, o 02, o 10, o 12 e o 13.

## D. Correções de cenário

**D1. Ringue para a tela de luta (vazio e de lado)**
```
2D pixel art background, retro 90s game look, chunky pixels, no anti-aliasing, dark gritty palette, underground fight ring inside an old warehouse seen straight from the side at ring level, the ring fills the whole width, EMPTY ring with nobody inside, red ropes in front, crowd silhouettes in the dark behind, hanging spotlights, smoky air, wide 16:9
```

**D2. Casa sem texto**
Use o prompt 18 original e acrescente no final: `posters with pictures only, no text, no letters anywhere`.

**D3. Loja com neon em português**
Use o prompt 19 original e troque `neon open sign` por `neon sign that says ABERTO`. Se as letras saírem erradas, peça `neon sign with a boxing glove symbol, no text`.

## E. O que ainda não foi feito (do arquivo de prompts original)

Use os prompts **21 a 28** de `docs/PROMPTS.md`:
- 21 Arena profissional
- 22 Luvas, 23 Shorts, 24 Protetores, 25 Comidas, 26 Ícones do menu
- 27 Logo, 28 Arte de capa

## F. Treino e casa (depois)

**F1. Treinando nos aparelhos**
```
2D pixel art sprite sheet, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image, side view, ONE ROW of 4 frames on a strict grid, equal space between frames: punching a hanging heavy bag, loop, transparent background
```
Repita com: `jumping rope`, `doing sit ups with a medicine ball`, `running on a treadmill`, `hitting focus mitts held by a coach`.

**F2. Casa**
Repita o F1 com `sleeping in bed` e `eating a plate of food sitting at a small table`.

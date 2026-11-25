# LONA — Poses do personagem em cada tela do app

Interface escolhida: **estilo A, Arena Mobile** (celular em pé, botões grandes e redondos, cores vivas, barra de abas embaixo).

## Formato do arquivo (importante)

A primeira rodada de poses (`art/v2-poses`) veio em **JPG com o xadrez cinza desenhado na imagem**: ele não é transparente de verdade.
Também veio com **texto escrito na imagem** ("Tela Inicial", "Personalização com Troca") e com riscos cinza no fundo.
Assim não dá para colocar o personagem por cima do cenário.

**Troque `transparent background` por este final em todos os prompts:**
```
solid flat pure magenta background (#FF00FF), no checkerboard, no text, no labels, no captions, no watermark, one single character centered
```
O fundo magenta é removido por código, de forma limpa. Se o Manus oferecer exportar em **PNG com transparência**, também serve.
Peça **uma pose por imagem**, nunca várias juntas numa folha.

## Antes de gerar

1. **Envie sempre a imagem de referência** junto com o prompt:
   - homem: `art/v1/01_protagonista_iniciante_homem.png`
   - mulher: `art/v1/02_protagonista_iniciante_mulher.png`
2. Gere **primeiro a pose 2 (personalização)**. Ela vira a referência das roupas, e as outras poses partem dela.
3. Para a versão feminina, repita cada prompt trocando `male` por `female` e a descrição do cabelo por `brown hair tied in a ponytail, sports top`.
4. Todas as poses saem com **fundo transparente**, **corpo inteiro** (menos as de busto) e o **mesmo tamanho de personagem**. O jogo coloca o cenário atrás.

O começo de todos os prompts é igual. É ele que mantém o mesmo estilo e o mesmo personagem:

```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands),
```

---

## Resumo: onde cada pose aparece

| # | Tela do app | Pose | Vista |
|---|---|---|---|
| 1 | Tela inicial (menu) | Guarda de luta, respirando | De frente |
| 2 | Personalização | Em pé, braços relaxados | De frente |
| 3 | Personalização (trocar short/luva) | Mesma pose 2, só muda a roupa | De frente |
| 4 | Perfil / avatar | Busto, rosto | De frente |
| 5 | Academia | Treinando em cada aparelho (5 poses) | De lado |
| 6 | Mestres | Ouvindo o mestre / cumprimento | Três quartos |
| 7 | Casa | Dormindo, comendo, descansando | De lado / três quartos |
| 8 | Loja | Admirando uma luva nova | De frente |
| 9 | Antes da luta (tela VS) | Pose confiante, busto | De frente |
| 10 | Luta | Guarda e golpes | De lado |
| 11 | Vitória | Braços para cima | De frente |
| 12 | Derrota | Sentado no chão, cabeça baixa | De frente |
| 13 | Subiu de nível | Mostrando o músculo | De frente |
| 14 | Sem energia | Mãos nos joelhos, ofegante | De frente |
| 15 | Com fome | Mão na barriga | De frente |
| 16 | Missão concluída / VIP | Joinha, sorrindo | De frente |

As poses **1, 2, 3, 4, 9, 10 e 11 são as essenciais**. As outras podem vir depois.
Para economizar créditos, todas podem ser **uma imagem parada**: o jogo faz o personagem "respirar" e se mexer de leve por código.

---

## 1. Tela inicial: guarda de luta, de frente
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, fighting stance with both fists raised in front of the face, feet apart, slightly bent knees, confident focused look straight at the camera, full body, centered, transparent background
```
Opcional, com animação (4 quadros): acrescente no final `ONE ROW of 4 frames on a strict grid, same size, feet on the same baseline, idle breathing loop with a small bounce`.

## 2. Personalização: em pé, braços relaxados, de frente
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, standing straight and relaxed, arms hanging down at the sides, feet slightly apart, neutral calm expression, symmetrical pose, full body, centered, transparent background
```

## 3. Personalização: trocando o short e as luvas
Use a imagem da **pose 2** como referência e peça só a troca da peça:
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, EXACTLY the same character and the same pose as the reference image, same body, same face, same hair, same position, change ONLY the shorts to [DESCRIÇÃO DO SHORT], everything else identical, full body, transparent background
```
Troque `[DESCRIÇÃO DO SHORT]` por cada opção da loja, por exemplo:
- `plain gray tactel shorts` (comum)
- `blue fight shorts with white side stripes` (raro)
- `purple professional fight shorts with gold trim` (épico)
- `yellow legendary fight shorts with lightning bolt pattern` (lendário)

Para as luvas, troque `change ONLY the shorts to ...` por `the character now wears [DESCRIÇÃO DA LUVA] boxing gloves, arms still relaxed at the sides`:
- `worn red training` (comum)
- `blue leather` (raro)
- `shiny purple professional` (épico)
- `golden legendary glowing` (lendário)

Se a IA mudar o corpo ou o rosto, repita o pedido com `do not change the body, face or pose`.

## 4. Perfil / avatar: busto de frente
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, taped hands), FRONT VIEW portrait, head and shoulders only, slight confident smile, looking at the viewer, centered, square image, transparent background
```

## 5. Academia: treinando em cada aparelho (de lado)
Base:
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), SIDE VIEW facing right, [AÇÃO], full body including the equipment, transparent background
```
Troque `[AÇÃO]` por:
- **Força:** `punching a hanging heavy leather bag, arm extended at the moment of impact`
- **Agilidade:** `jumping rope, both feet in the air, rope passing under the feet`
- **Resistência:** `doing sit-ups on a mat holding a medicine ball`
- **Técnica:** `punching focus mitts held by an old coach standing in front of him`
- **Cardio:** `running on an old treadmill, sweating`

## 6. Mestres: ouvindo o mestre (três quartos)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), THREE-QUARTER VIEW facing right, standing respectfully, slight bow with the head, one fist touching the open palm of the other hand in a martial arts salute, full body, transparent background
```

## 7. Casa
**Dormindo:**
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts), SIDE VIEW, sleeping lying on his back on a simple single bed, one arm over the forehead, peaceful face, small "Z" letters floating, transparent background
```
**Comendo:**
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), THREE-QUARTER VIEW, sitting at a small table eating a big plate of rice, beans and chicken with a fork, happy hungry face, transparent background
```
**Descansando:**
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts), THREE-QUARTER VIEW, sitting on the edge of the bed with a towel around the neck, drinking water from a bottle, relaxed, transparent background
```

## 8. Loja: admirando a luva nova (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, holding a pair of new red boxing gloves up with both hands, looking at them with excited eyes and a big smile, full body, transparent background
```

## 9. Antes da luta: tela VS (busto de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, taped hands), FRONT VIEW, waist up, intense serious stare at the viewer, one fist raised close to the camera, dramatic pose for a versus screen, transparent background
```
Faça o mesmo para o rival (`art/v1/13_rival_campeao_diogo.png` como referência), trocando a descrição por `arrogant blond champion with golden belt on the shoulder, smirking`.

## 10. Luta: guarda e golpes (de lado)
Use os prompts **A1 a A5** de `docs/PROMPTS-2.md`. Se os créditos estiverem curtos, faça só estes três, como imagens paradas:
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), SIDE VIEW facing right, [POSE], full body, transparent background
```
- `fighting guard stance, fists up`
- `throwing a straight punch with the arm fully extended`
- `getting hit, head snapping back, eyes closed`

## 11. Vitória (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, celebrating a victory, both arms raised high with fists closed, shouting with joy, full body, transparent background
```

## 12. Derrota (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW, sitting on the floor with knees up, arms resting on the knees, head down, tired and bruised, small bandage on the cheek, full body, transparent background
```

## 13. Subiu de nível (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, flexing both biceps proudly, big confident smile, small yellow sparkles around him, full body, transparent background
```

## 14. Sem energia (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW, exhausted, bent forward with hands on the knees, sweating a lot, breathing hard, full body, transparent background
```

## 15. Com fome (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW, standing with one hand on his stomach, hungry tired face, small stomach growl lines, full body, transparent background
```

## 16. Missão concluída / VIP (de frente)
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands), FRONT VIEW facing the viewer, giving a thumbs up with one hand and winking, happy, full body, transparent background
```

# LONA — Plano de arte no Manus (um pouco por dia)

Ferramenta: **só o Manus**. As poses de `art/v2-poses` (feitas no Gemini) servem só como rascunho de referência.

## Regras para todo dia
1. **Uma imagem por pedido**, nunca várias numa folha.
2. **Envie a imagem de referência** junto: `art/v1/01_protagonista_iniciante_homem.png`.
3. **Termine todo prompt com:**
```
solid flat pure magenta background (#FF00FF), no checkerboard, no text, no labels, no watermark, one single character centered, full body
```
4. Peça **PNG**. Se ele oferecer transparência de verdade, melhor ainda.
5. No fim do dia, me mande o que saiu bom. Eu reviso, recorto e encaixo no exemplo.

O começo de todos os prompts é sempre este (a seguir chamado de **[BASE]**):
```
2D pixel art, retro 90s game look, chunky pixels, no anti-aliasing, dark outline, warm gritty color palette, the same young male street fighter from the reference image (messy black hair, white tank top, red shorts, taped hands),
```

---

## Dia 1: as duas poses principais
- [ ] **Tela inicial:** `[BASE] FRONT VIEW facing the viewer, fighting stance with both fists raised in front of the face, feet apart, slightly bent knees, confident focused look`
- [ ] **Personalização:** `[BASE] FRONT VIEW facing the viewer, standing straight and relaxed, arms hanging down at the sides, feet slightly apart, neutral calm expression, symmetrical pose`

Quando a pose de Personalização ficar boa, **ela vira a referência** dos dias 2 e 3.

## Dia 2: troca de short (referência: a pose de Personalização do dia 1)
Prompt: `EXACTLY the same character and the same pose as the reference image, change ONLY the shorts to [SHORT], do not change the body, face or pose`
- [ ] `plain gray tactel shorts`
- [ ] `blue fight shorts with white side stripes`
- [ ] `purple professional fight shorts with gold trim`
- [ ] `yellow legendary fight shorts with lightning bolt pattern`

## Dia 3: troca de luvas (referência: a pose de Personalização)
Prompt: `EXACTLY the same character and the same pose as the reference image, the character now wears [LUVA] boxing gloves, arms still relaxed at the sides, do not change the body, face or pose`
- [ ] `worn red training`
- [ ] `blue leather`
- [ ] `shiny purple professional`
- [ ] `golden legendary glowing`

## Dia 4: perfil e tela de confronto
- [ ] **Perfil:** `[BASE] FRONT VIEW portrait, head and shoulders only, slight confident smile, looking at the viewer` (aqui troque `full body` do final por `square image`)
- [ ] **Antes da luta (VS):** `[BASE] FRONT VIEW, waist up, intense serious stare at the viewer, one fist raised close to the camera, dramatic pose`
- [ ] **Rival no VS** (referência `art/v1/13_rival_campeao_diogo.png`): mesmo prompt, trocando a descrição do personagem por `arrogant blond champion with golden belt on the shoulder, smirking`

## Dia 5: luta (de lado)
Prompt: `[BASE] SIDE VIEW facing right, [POSE]`
- [ ] `fighting guard stance, fists up`
- [ ] `throwing a straight punch with the arm fully extended`
- [ ] `throwing a high kick`
- [ ] `getting hit, head snapping back, eyes closed` (sem cor vermelha: o piscar vermelho é feito por código)

## Dia 6: resultado da luta
- [ ] **Vitória:** `[BASE] FRONT VIEW facing the viewer, celebrating a victory, both arms raised high with fists closed, shouting with joy`
- [ ] **Derrota:** `[BASE] FRONT VIEW, sitting on the floor with knees up, arms resting on the knees, head down, tired and bruised`
- [ ] **Nocauteado:** `[BASE] SIDE VIEW, lying on his back on the floor knocked out, eyes closed`

## Dia 7: academia (de lado)
Prompt: `[BASE] SIDE VIEW facing right, [AÇÃO], including the equipment`
- [ ] `punching a hanging heavy leather bag`
- [ ] `jumping rope, both feet in the air`
- [ ] `doing sit-ups on a mat holding a medicine ball` (conferir se é o mesmo personagem, com cabelo)
- [ ] `punching focus mitts held by an old coach`
- [ ] `running on an old treadmill, sweating`

## Dia 8: casa e loja
- [ ] `[BASE] SIDE VIEW, sleeping lying on his back on a simple single bed, one arm over the forehead`
- [ ] `[BASE] THREE-QUARTER VIEW, sitting at a small table eating a big plate of rice, beans and chicken`
- [ ] `[BASE] THREE-QUARTER VIEW, sitting on the edge of the bed with a towel around the neck, drinking water`
- [ ] **Loja:** `[BASE] FRONT VIEW facing the viewer, holding a pair of new red boxing gloves up with both hands, excited smile`

## Dia 9: ícones dos itens (fundo magenta, um item por imagem)
- [ ] 4 luvas, 4 shorts, 4 protetores: `2D pixel art item icon, retro 90s game look, chunky pixels, dark outline, [ITEM], centered, solid flat pure magenta background (#FF00FF), no text`

## Dia 10: momentos especiais
- [ ] Subiu de nível (mostrando o bíceps)
- [ ] Sem energia (mãos nos joelhos)
- [ ] Com fome (mão na barriga)
- [ ] Missão concluída (joinha)

## Depois: versão feminina
Repita os dias 1 a 8 com a referência `art/v1/02_protagonista_iniciante_mulher.png`, trocando no [BASE] a descrição por:
`the same young female street fighter from the reference image (brown hair tied in a ponytail, sports top, faded shorts, taped hands)`

---

**Prioridade se os créditos acabarem:** dias 1, 2, 5 e 6. Com eles já dá para ter tela inicial, personalização e luta.

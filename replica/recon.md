# Recon: gestão de lutador (referência: Punchclub_copy)

Método: replica-recon, clean-room. Este documento descreve **mecânicas e fluxos**.
Nenhum código, imagem, som, nome ou texto do original foi levado para o projeto.

## Fonte e licença
- Repo de estudante (C++/Win32, 4 semanas). **Sem arquivo LICENSE** → código não pode ser reaproveitado.
- ~320 imagens (bmp/png) vindas do jogo original → **não usar**.
- O projeto só chegou até "shadow boxing"; o sistema de luta completo não existe nele.

## Telas / locais (inventário)
| Tela | Função |
|---|---|
| Título | menu inicial |
| Casa | descansar, dormir, comer |
| Mapa (HUD) | escolher destino |
| Academia | treinar atributos |
| Trabalho | ganhar dinheiro |
| Loja | comprar comida/itens |
| Liga: espera / luta | marcar e disputar lutas |
| Árvore de habilidades | gastar pontos em golpes |
| Pré-luta | ver atributos e montar habilidades |
| Game over | fim de jogo |

## Modelo de dados (inferido)
- **Atributos:** força, agilidade, estamina. Sobem por experiência acumulada (cada treino dá XP; a cada bloco de XP sobe 1 ponto).
- **Vitais:** saúde, comida (fome), humor, energia.
- **Economia:** dinheiro, barra de progresso do trabalho.
- **Inventário:** itens consumíveis que alteram os vitais.
- **Estado:** local atual, ação em andamento, cansado (sim/não).

## Loop central
1. Ir ao local pelo mapa (gasta tempo).
2. Agir: treinar (↑ atributo, ↓ energia/comida), trabalhar (↑ dinheiro, ↓ energia), comer/dormir (recupera vitais).
3. Quando os vitais acabam, o personagem fica cansado e não age.
4. Lutar na liga: resultado depende dos atributos + habilidades escolhidas.
5. Vencer dá dinheiro, rank e pontos de habilidade.

## Matriz de funções
| Função | Prioridade |
|---|---|
| Atributos com XP | essencial |
| Vitais + ciclo de dias | essencial |
| Trabalho → dinheiro | essencial |
| Loja de comida | essencial |
| Luta simulada por atributos | essencial |
| Liga com ranking | importante |
| Árvore de habilidades | importante |
| Eventos / história | depois |

## Próximo passo
replica-architect → decidir stack (web/React) e regras numéricas próprias;
depois replica-design (visual novo, do seu jogo) e replica-build (protótipo).

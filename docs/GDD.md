# LONA — Documento de Design do Jogo (GDD)

> Versão 0.1 · nome provisório **LONA** (alternativas curtas: Nocaute, Brabo, Ringue, Golpe)
> Referência de gênero: jogos de gerenciamento de lutador como Punch Club. Usamos só as **ideias de mecânica** (treinar, comer, evoluir, lutar).
> Nome, personagens, arte, história e textos são **originais** deste projeto.

## 1. Visão

Jogo **online no navegador** (PC e celular) de carreira de lutador. O jogador cria uma conta e um lutador, treina, se alimenta,
aprende técnicas com mestres, compra equipamentos e sobe no **ranking PvP** enfrentando lutadores do mesmo nível.

**Fantasia do jogador:** "sair do beco e chegar ao cinturão".

**Sessão típica:** 5–10 minutos, várias vezes por dia. A energia recarrega com o tempo real.

## 2. Decisões já tomadas

| Área | Decisão |
|---|---|
| Plataforma | Navegador (PC + celular); pode virar app depois |
| Conta | Login com **Google** e **Apple** |
| Visual | **Pixel art urbano**, arte própria gerada com IA (pasta `art/`) |
| Interface | **Estilo A, Arena Mobile**: celular em pé, botões grandes e redondos, cores vivas, barra de abas embaixo |
| Personalização | Personagem **de frente, em pé, braços relaxados**; troca de short e luvas sobre essa pose |
| Ciclo | Treinar · Comer · Dormir · Lutar |
| Necessidades | **Energia** e **Saciedade** (versão simplificada) |
| Tempo | Energia recarrega em tempo real |
| Limite de lutas | **Só a energia** limita (sem fichas) |
| PvP | **Luta automática**: o jogador monta o deck e assiste |
| Vitória | Só por **nocaute** |
| Matchmaking | Oponentes de até **±2 níveis**; dá para lutar contra quem está offline |
| Rank | Divisões Bronze → Prata → Ouro → Diamante → Campeão, temporada mensal |
| Derrota | Perde pontos de rank, mas ganha XP e um pouco de moeda |
| PvE | **Não há.** Só PvP (com "fantasmas" quando a faixa de nível estiver vazia) |
| Nível máximo | **50** |
| Atributos | Força, Agilidade, Resistência, Técnica, Cardio |
| Atributos caem? | **Não** |
| Técnicas | Compradas com **mestres** de cada arte |
| Artes | Arte principal **fixa** na criação; pode aprender técnicas de outras |
| Lançamento | 4 artes (Boxe, Muay Thai, Jiu-jitsu, Capoeira), +1 por temporada |
| Treino | Aparelhos por atributo + academias pagas melhores |
| Moedas | **Moedas** (comum, ganha jogando) e **Ouro** (premium, dinheiro real) |
| Renda comum | Vitórias, missões diárias, prêmio de temporada |
| Renda real | **VIP mensal**, **itens visuais**, **venda de Ouro** |
| Loja | Todos os itens à venda, os melhores também por Ouro |
| Equipamento | Luvas, Shorts, Protetor bucal |
| Personagem | Personalização média: nome, apelido, arte, pele, cabelo, barba, tatuagem |
| Social | Equipes de jogadores, amigos + desafio amistoso, chat |

## 3. Ciclo principal

```
          ┌──────────── energia recarrega com o tempo ────────────┐
          ▼                                                        │
   TREINAR (−energia, −saciedade) ──► atributos ↑ e XP ↑ ──► SUBIR DE NÍVEL
          │                                                        │
   COMER (−moedas, +saciedade)                      novos espaços no deck,
          │                                         técnicas e equipamentos
          ▼                                                        │
   LUTAR PvP (−energia) ──► moedas + XP + pontos de rank ◄─────────┘
          │
   MESTRES / LOJA (−moedas) ──► técnicas e equipamentos melhores
```

## 4. Personagem

### 4.1 Atributos

| Atributo | Efeito na luta |
|---|---|
| **Força** | Multiplicador de dano: `1 + Força/40` |
| **Agilidade** | Velocidade (age mais vezes) e esquiva |
| **Resistência** | Vida (`100 + 4×Res`) e armadura (reduz cada golpe) |
| **Técnica** | Chance de crítico (×1,6) e reduz a esquiva do oponente |
| **Cardio** | Fôlego (`60 + 3×Cardio`); sem fôlego o lutador bate fraco e precisa respirar |

Todos começam em 5. A arte principal dá +5 distribuídos (ex.: Muay Thai +3 Força, +2 Resistência).

### 4.2 Nível e XP
- XP para o próximo nível: `50 + 20 × nível^1,2` (nível 1: 70 · nível 20: ~780 · nível 49: ~2170).
- XP vem do treino (`10 + 1,5 × nível`) e das lutas (vitória `40 + 5×nível`, derrota `15 + 2×nível`).
- Espaços no deck: 3 no nível 1 → 4 (nv 3) → 5 (nv 8) → 6 (nv 15) → 7 (nv 25) → 8 (nv 40).

### 4.3 Necessidades
- **Energia**: máx. 100 (VIP 150). Recarrega 1 a cada 3 min (VIP 2 min). Dormir dá +50 (a cada 6 h).
- **Saciedade**: máx. 100. Treinar −8, lutar −12. Abaixo de 20 o treino rende metade; em 0 não treina nem luta.

## 5. Treino

| Aparelho | Atributo |
|---|---|
| Saco de pancada | Força |
| Pular corda | Agilidade |
| Abdominal com medicine ball | Resistência |
| Sparring | Técnica |
| Esteira | Cardio |

Ganho por treino: `3 × multiplicador da academia × 25 / (25 + valor atual)`. Quanto mais alto o atributo, mais devagar ele sobe.

| Academia | Nível | Mensalidade (7 dias) | Multiplicador |
|---|---|---|---|
| Academia do Bairro | 1 | grátis | 1,0 |
| CT Profissional | 8 | 200 moedas | 1,4 |
| Centro de Elite | 20 | 600 moedas | 1,9 |

**Whey** (150 moedas): próximos 5 treinos +50%. **Energético** (5 Ouro): +40 energia.

## 6. Artes e técnicas

- **Arte principal** (fixa): técnicas dela causam **+20% de dano** e têm preço normal.
- **Outras artes**: custam **+50%** e não ganham o bônus. Servem para **cobrir fraquezas** (ex.: um boxeador que aprende
  Raspagem do jiu-jitsu para se defender, ou Bloqueio de Canela do Muay Thai).
- **Especialista**: deck só com técnicas da arte principal dá **+10% de dano e +10% de vida**.

Tipos de técnica:
- **Ataque**: dano, custo de fôlego e recarga (ações até usar de novo).
- **Defesa** (reativa): chance de ativar quando é atingido e quanto reduz (100% = escapa).
- **Preparo**: deixa os próximos golpes mais fortes (Clinch, Queda).
- **Passiva**: bônus permanente (+vida, +esquiva, +fôlego).

Cada arte tem 7–8 técnicas, 3 delas iniciais grátis. A lista completa e os números ficam em `src/game/data.ts`.

| Arte | Mestre | Estilo |
|---|---|---|
| Boxe | Mestre Tião "Mão de Pedra" | Golpes baratos e rápidos, esquiva total |
| Muay Thai | Kru Somchai | Golpes pesados, bloqueio, Clinch |
| Jiu-jitsu | Mestre Carla "Polvo" | Queda (+50% em 3 golpes), finalizações fortes |
| Capoeira | Mestre Bimbinha | Ginga, Rasteira que atordoa, chutes giratórios |

**Próximas artes (1 por temporada):** Wrestling, Karatê, Taekwondo, Kickboxing, Judô, Sambo, Kung Fu, Krav Maga,
Luta Livre brasileira, Savate.

## 7. Luta (automática)

1. Cada lutador tem uma barra de iniciativa que enche conforme a Agilidade. Quem enche age.
2. Na sua vez escolhe um **preparo** (se tiver) ou um **ataque** pronto do deck (golpes fortes têm mais chance).
3. O defensor pode **esquivar** (Agilidade) ou ativar uma **defesa** do deck.
4. Dano = `poder × Força × bônus da arte × crítico × variação (±15%) − armadura`.
5. **Rounds** de 12 ações. Entre rounds os dois recuperam 30% do fôlego.
6. **Só termina em nocaute.** A partir do 4º round o cansaço aumenta o dano em +30% por round, garantindo o fim
   (média atual: ~2,2 rounds).
7. A luta é **determinística pela semente**: com os mesmos lutadores e a mesma semente o resultado é igual.
   Isso permite **replay** e que o **servidor** calcule e confira o resultado (contra trapaça).

**Equilíbrio atual** (simulação com 4.000 lutas entre artes diferentes):

| Nível | Boxe | Muay Thai | Jiu-jitsu | Capoeira |
|---|---|---|---|---|
| 1 | 58% | 46% | 43% | 53% |
| 10 | 45% | 44% | 61% | 50% |
| 25 | 45% | 55% | 51% | 48% |

Meta: todas entre 45% e 55%. Rodar com `npx vite-node tests/balance.ts`.

## 8. PvP e ranking

- Só aparecem oponentes até **±2 níveis**. Luta-se contra o **personagem** do outro jogador (mesmo offline), com o
  deck e os equipamentos que ele deixou.
- Faixa vazia → o servidor completa com um **fantasma** gerado.
- Vitória: **+25 pts** (+5 por nível que o oponente tiver acima de você). Derrota: **−15 pts** (não fica negativo).
- Divisões: Bronze 0 · Prata 300 · Ouro 700 · Diamante 1200 · Campeão 2000.
- **Temporada mensal**: no fim, prêmios por divisão (moedas, Ouro, visual exclusivo) e os pontos reiniciam parcialmente.
- Custo da luta: 20 de energia e 12 de saciedade.

## 9. Economia

### 9.1 Moedas (comum)
Entra por: vitórias (`30 + 5×nível`), derrotas (10), trabalho, missões diárias, prêmios de temporada.
Sai por: comida, academias, técnicas, equipamentos, whey.

**Trabalho (bicos):** troca energia e saciedade por moedas, sem XP e sem bônus VIP. Pagamento =
`energia × (taxa + 0,06 × nível)`. É a renda garantida de quem está perdendo, mas sempre rende menos de 70% das moedas
por energia que a média de lutar (com 50% de vitórias), e mais do que só perder.

| Bico | Nível | Energia | Saciedade | Taxa |
|---|---|---|---|---|
| Balcão da Lanchonete | 1 | 10 | 4 | 0,6 |
| Entregas de Bicicleta | 6 | 20 | 10 | 0,7 |
| Segurança de Show | 15 | 30 | 12 | 0,8 |

Missões diárias: treine 3× (50), vença 2 lutas (80), faça 2 refeições (30).

### 9.2 Ouro (premium)
Comprado com dinheiro real. Usado em: VIP, equipamentos lendários, energético, visuais.

| Pacote | Preço sugerido |
|---|---|
| 50 Ouro | R$ 4,90 |
| 120 Ouro | R$ 9,90 |
| 300 Ouro | R$ 19,90 |

### 9.3 VIP mensal (100 Ouro / 30 dias)
- Energia máxima 150 (normal 100) → **mais lutas por dia**
- Energia recarrega a cada 2 min (normal 3)
- +20% de XP, de ganho de treino e de moedas nas lutas
- Selo VIP e visuais exclusivos da temporada

### 9.4 Proteção contra "pay-to-win"
A loja vende tudo, mas:
- Todo item tem **nível mínimo** (o lendário só a partir do nível 20).
- O bônus somado dos equipamentos tem **teto de +15 por atributo**.
- O PvP é por faixa de nível, então quem paga enfrenta gente do mesmo nível.

## 10. Equipamentos

| Raridade | Nível | Preço | Exemplo (Luvas) |
|---|---|---|---|
| Comum | 1 | 50–80 moedas | Luva de Treino: +2 Força |
| Raro | 5–6 | 250–300 moedas | Luva de Couro: +5 Força, +1 Técnica |
| Épico | 12 | 750–900 moedas | Luva Profissional: +9 Força, +3 Técnica |
| Lendário | 20 | 50–60 Ouro | Martelo de Ouro: +14 Força, +5 Técnica |

Shorts dão Agilidade/Cardio; protetor bucal dá Resistência. O visual muda a cor no boneco.

## 11. Social (versão online)
- **Equipes**: nome, brasão, ranking de equipes por soma de pontos.
- **Amigos**: adicionar e **desafiar para luta amistosa** (não mexe no rank, gasta pouca energia).
- **Chat** global e da equipe, com filtro de palavras, denúncia e bloqueio.

## 12. Arquitetura técnica

```
src/game/   ← regras do jogo (TypeScript puro, sem tela). Vai rodar também no servidor.
  data.ts       todos os números de balanceamento
  state.ts      jogador, atributos efetivos, níveis
  actions.ts    treinar, comer, dormir, comprar, aprender, lutar...
  fight.ts      simulação determinística da luta
  opponents.ts  geração de oponentes "fantasma"
  rng.ts        aleatório com semente
src/ui/     ← telas do navegador (protótipo sem framework)
tests/      ← testes automáticos + simulação de balanceamento
```

### Fases

| Fase | Conteúdo | Status |
|---|---|---|
| **0 · Protótipo local** | Criação, treino, comida, sono, mestres, loja, deck, luta animada, ranking com fantasmas, missões, VIP simulado. Salva no navegador. | ✅ feito |
| **1 · Online** | Servidor + banco de dados; login Google/Apple; o servidor executa as ações (contra trapaça); PvP contra personagens reais; temporadas | próximo |
| **2 · Pagamentos** | Ouro e VIP com Pix/cartão (Mercado Pago ou Stripe); recibos; termos de uso e LGPD | |
| **3 · Social** | Amigos, desafio amistoso, equipes, chat com moderação | |
| **4 · Arte e som** | Pixel art definitiva (sprites, cenários, animações), música e efeitos | |
| **5 · Conteúdo** | Nova arte por temporada, eventos, visuais | |

Sugestão para a fase 1: **Supabase** (banco Postgres, login Google/Apple pronto, funções no servidor), com as regras de
`src/game/` rodando no servidor. Hospedagem do site na Vercel ou Netlify.

## 13. Pontos em aberto
- Nome definitivo do jogo e checagem de marca/domínio.
- Prêmios exatos de cada divisão no fim da temporada e quanto dos pontos reinicia.
- Preço real do VIP e dos pacotes de Ouro.
- Lista de itens visuais pagos (sem atributo) para a loja de Ouro.
- Classificação indicativa (violência) e regras para menores de idade nas compras.
- Lutas amistosas: gastam energia? Contam para missões?

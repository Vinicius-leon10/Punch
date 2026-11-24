# LONA (nome provisório)

Jogo online de carreira de lutador no navegador: crie seu lutador, treine, coma, aprenda técnicas com mestres,
compre equipamentos e suba no ranking PvP contra lutadores do seu nível.

- Design completo: [docs/GDD.md](docs/GDD.md)
- Status: **protótipo local** (fase 0). O progresso fica salvo no navegador; o modo online vem na fase 1.

## Rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes automáticos das regras
npm run build    # versão final em dist/
npx vite-node tests/balance.ts   # simulação de equilíbrio entre as artes
```

No rodapé do jogo há um **modo teste** para avançar o relógio (recarregar energia) e apagar o personagem.

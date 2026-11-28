import './style.css';
import { startApp } from './ui/app';

startApp(document.getElementById('app')!);

// App instalado (Adicionar à Tela de Início): guarda o jogo para abrir sem internet.
if (import.meta.env.PROD && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* sem service worker (ex.: dentro de outra página): o jogo funciona online */
    });
  });
}

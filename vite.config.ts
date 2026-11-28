import { defineConfig, type Plugin } from 'vite';

/**
 * Gera o service worker (sw.js) com a lista de todos os arquivos do build,
 * para o jogo instalado no celular abrir e funcionar sem internet.
 */
function offlineCache(): Plugin {
  return {
    name: 'lona-offline-cache',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = ['./', 'index.html', 'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', ...Object.keys(bundle)];
      const version = Object.keys(bundle).filter((f) => f.endsWith('.js')).join('|');
      let hash = 0;
      for (const ch of version) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
      const source = `// Gerado no build. Guarda o jogo para abrir sem internet.
const CACHE = 'lona-${(hash >>> 0).toString(36)}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('lona-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Página: tenta a rede (para pegar atualizações) e cai no cache sem internet.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html')),
    );
    return;
  }
  // Fontes do Google e arquivos do jogo: cache primeiro.
  if (url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok || res.type === 'opaque') {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({ base: './', plugins: [offlineCache()] });

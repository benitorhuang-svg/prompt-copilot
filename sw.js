const CACHE_NAME = 'prompt-copilot-v2';

function getBasePath() {
  return self.registration.scope;
}

function getShellAssets() {
  const base = getBasePath();
  return [
    base,
    `${base}index.html`,
    `${base}manifest.webmanifest`,
    `${base}icons/icon.svg`
  ];
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(getShellAssets())));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});


var CACHE_NAME = 'utilidades-v1';
var urlsToCache = [
    './index.html',
    './dashboard.html',
    './reader.html'
];

// Instala e cacheia os arquivos base
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Limpa caches antigos ao atualizar
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) { return caches.delete(name); })
            );
        })
    );
    self.clients.claim();
});

// Network first, fallback to cache (importante para dados em tempo real)
self.addEventListener('fetch', function(event) {
    // Não cachear requests do Firebase
    if (event.request.url.includes('firebase') || event.request.url.includes('gstatic')) {
        return;
    }
    event.respondWith(
        fetch(event.request).then(function(response) {
            // Atualiza o cache com a versão nova
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
            });
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});


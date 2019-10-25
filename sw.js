const cacheName = 'TxtToSL-Web';
const staticAssets = [
    './',
    './index.html',
    './?homescreen=1',
    './index.html?homescreen=1',
    './styles.css',
    './code.js',
    './manifest.json',
    './waveimages/wave-bot.png',
    './waveimages/wave-mid.png',
    './waveimages/wave-top.png',
    './favicon.ico',
    './icons/logo_192.png',
    './icons/logo_512.png'
];

self.addEventListener('install', async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});

self.addEventListener('activate', e => {
    self.clients.claim();
});

self.addEventListener('fetch', async e => {
    const req = e.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        e.respondWith(cacheFirst(req));
    } else {
        e.respondWith(networkAndCache(req));
    }
});

function cacheFirst(req) {
    const cached = caches.open(cacheName).then((cache) => {
        return cache.match(req);
    });
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(req);

        if (new URL(req.url).href === 'https://vps.oojmed.com/TTSL_O/v1/version' || new URL(req.url).href === 'https://vps.oojmed.com/TTSL_O/v1/heartbeat') {
            return fresh;
        }

        await cache.put(req, fresh.clone());

        return fresh;
    } catch(e) {
        const cached = await cache.match(req);
        return cached;
    }
}
const baseCacheName = 'TxtToSL-Web';
const versionName = 'v2019-10-25.3';
const cacheName = baseCacheName + '-' + versionName;
const runtimeCacheName = cacheName + '-runtime';

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
    './icons/logo_512.png',

    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js',
    'https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(staticAssets))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [cacheName, runtimeCacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    //e.respondWith(networkAndCache(req));
  }
});

function cacheFirst(request) {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) {
      return cachedResponse;
    }

    return caches.open(runtimeCacheName).then(cache => {
      return fetch(request).then(response => {
        // Put a copy of the response in the runtime cache.
        return cache.put(request, response.clone()).then(() => {
          return response;
        });
      });
    });
  });
}
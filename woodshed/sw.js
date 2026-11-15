// sw.js — makes Woodshed work offline.
// Strategy: try the network first so a new version shows up as soon as it is published,
// and fall back to the saved copy when there is no connection.
// Bump VERSION whenever the list of files changes.

const VERSION = 'woodshed-0.3.0';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/audio.js', 'js/curriculum.js', 'js/dom.js', 'js/drills.js', 'js/floors.js', 'js/harmony.js',
  'js/lessons.js', 'js/motion.js', 'js/neck.js', 'js/songs.js', 'js/songsui.js', 'js/store.js', 'js/sync.js', 'js/theory.js', 'js/tunes.js', 'js/widgets.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('woodshed-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only this app's own files. Sync requests to GitHub always go straight to the network.
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((cache) => cache.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))),
  );
});

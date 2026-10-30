// Сервис-воркер «Разливного»: нужен, чтобы сайт ставился как приложение.
// Страницы и API всегда берём из сети (свежие цены и заказы), картинки — из кэша.
const CACHE = 'razlivnoy-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/img/logo_strip.jpg', '/img/wood.jpg', '/img/ufo.jpg', '/img/icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/img/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
    })));
    return;
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#1b120c;color:#fff6e6;font:18px sans-serif;text-align:center;padding:60px 20px">Нет интернета 😔<br><br>Позвоните нам: <a style="color:#f7b500" href="tel:+79224441882">+7 922 444-18-82</a></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
  }
});

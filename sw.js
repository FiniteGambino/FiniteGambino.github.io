// Schedule app service worker.
// Strategy: stale-while-revalidate for the app shell.
// The page is served from cache instantly (fast cold boot on iOS, where Safari
// kills backgrounded web apps), while a fresh copy is fetched in the background
// and used on the next open.

const CACHE = 'schedule-shell-v2';
const SHELL = ['./schedule.html'];

self.addEventListener('install', e => {
  // NOTE: deliberately no skipWaiting() here. A new worker installs and then
  // WAITS, so the page can show an "update available" prompt and let the user
  // decide when to swap. The page sends SKIP_WAITING when they tap it.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .catch(() => {})
  );
});

// The page asks us to activate immediately (user tapped "Update").
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache Firebase / backend / API traffic — that must always hit the
  // network so the schedule data stays live.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  // Only manage the schedule shell; leave other pages in the repo alone.
  if (!url.pathname.endsWith('/schedule.html')) return;

  e.respondWith((async () => {
    const cache  = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    // Kick off a background refresh regardless.
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    // Serve cache immediately if we have it; otherwise wait for the network.
    return cached || (await network) || new Response('Offline', { status: 503 });
  })());
});

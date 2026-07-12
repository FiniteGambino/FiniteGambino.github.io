// Schedule app service worker.
// Strategy: stale-while-revalidate for the app shell.
// The page is served from cache instantly (fast cold boot on iOS, where Safari
// kills backgrounded web apps), while a fresh copy is fetched in the background
// and used on the next open.

const CACHE = 'schedule-shell-v3';
const SHELL = ['./schedule.html'];

self.addEventListener('install', e => {
  // Bootstrap exception: v3 is the FIRST worker that knows how to show an
  // "update available" prompt. Every version currently deployed in the wild
  // (v1/v2) has no such prompt, so waiting politely for user consent here
  // would mean v3 never surfaces at all without a manual double-open. v3
  // activates itself immediately, once, to get everyone onto prompt-aware
  // code. From v4 onward, remove this skipWaiting() call and go back to
  // waiting — v3 will be there to show the prompt properly.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// The page asks us to activate immediately (user tapped "Update").
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // Explicitly tell every open tab a new version just took over. This covers
    // the one case the page-side "controllerchange" listener can miss on its
    // own: a tab that had NO worker controlling it yet (e.g. the very first
    // time this update-aware worker replaces an older, silent one). Without
    // this, that tab would keep running old code until manually reloaded.
    const clientList = await self.clients.matchAll({ type: 'window' });
    clientList.forEach(c => c.postMessage({ type: 'SW_ACTIVATED' }));
  })());
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

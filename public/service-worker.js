importScripts('https://storage.googleapis.com/workbox-cdn/4.3.1/workbox-sw.js');
if (workbox) {
    workbox.routing.registerRoute(
        ({ url }) => url.pathname.startsWith('/api/search'),
        new workbox.strategies.NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 3 })
    );
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new workbox.strategies.CacheFirst({ cacheName: 'img-cache' })
    );
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'script' || request.destination === 'style',
        new workbox.strategies.StaleWhileRevalidate({ cacheName: 'asset-cache' })
    );
}
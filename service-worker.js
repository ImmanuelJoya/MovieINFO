self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event);
});

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js')
    .catch((error) => {
        console.error('Failed to load Workbox:', error);
    });

if (workbox) {
    console.log('Workbox loaded successfully');
    workbox.routing.registerRoute(
        ({ url }) => url.pathname.startsWith('/api/search'),
        new workbox.strategies.NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 3 })
    );
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new workbox.strategies.CacheFirst({ cacheName: 'img-cache' })
    );
} else {
    console.error('Workbox failed to load');
}
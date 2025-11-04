const CACHE_NAME = 'rfpwa-cache-v2';
const ASSETS = [
	'/',
	'/index.html',
	'/manifest.webmanifest',
	'/src/main.jsx',
	'/src/App.jsx',
	'/src/Login.jsx',
	'/src/firebase.js',
	'/src/styles.css'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS).catch((err) => {
				console.warn('Failed to cache some assets:', err);
			});
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	
	// Skip Firebase and external API calls
	if (request.url.includes('firebase') || 
	    request.url.includes('googleapis.com') ||
	    request.url.includes('google.com')) {
		return; // Let these go to network
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) {
				return cached;
			}
			return fetch(request).then((response) => {
				// Only cache successful responses
				if (response.status === 200) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, clone);
					});
				}
				return response;
			}).catch(() => {
				// If offline and not cached, return a basic offline response for HTML
				if (request.headers.get('accept').includes('text/html')) {
					return caches.match('/index.html');
				}
			});
		})
	);
});



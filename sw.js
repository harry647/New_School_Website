// Service Worker for School Website
// Enables PWA functionality with offline capabilities and caching strategies

const CACHE_NAME = 'school-website-v1.2.0';
const STATIC_CACHE = 'static-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-v1.2.0';
const API_CACHE = 'api-v1.2.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/index.html',
  '/static/about.html',
  '/static/academics.html',
  '/static/administration.html',
  '/static/admissions.html',
  '/static/student-life.html',
  '/static/gallery.html',
  '/static/news-events.html',
  '/static/alumni.html',
  '/static/contact.html',
  '/static/e-learning.html',
  '/static/career-guidance.html',
  '/clubs/clubs.html',
  '/css/app.css',
  '/css/tailwind.css',
  '/js/static/index.js',
  '/js/static/about.js',
  '/js/static/academics.js',
  '/js/static/administration.js',
  '/js/static/admissions.js',
  '/js/static/student-life.js',
  '/js/static/gallery.js',
  '/js/static/news-events.js',
  '/js/static/alumni.js',
  '/js/static/contact.js',
  '/js/static/e-learning.js',
  '/js/static/career-guidance.js',
  '/assets/images/common/hero-bg.jpg',
  '/assets/images/common/logo.png',
  '/assets/images/common/favicon.ico'
];

// API endpoints that should be cached with network-first strategy
const API_ENDPOINTS = [
  '/api/news',
  '/api/events',
  '/api/gallery',
  '/api/staff',
  '/api/alumni'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then(cache => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  
  // Handle other requests with network-first strategy
  event.respondWith(handleDynamicRequest(request));
});

// Network-first strategy for API requests
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses (but not for sensitive endpoints)
      if (!isSensitiveEndpoint(request.url)) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API failures
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This content is not available offline' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to load static asset:', request.url);
    
    // Return placeholder for missing images
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return new Response(
        '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f3f4f6"/><text x="100" y="75" text-anchor="middle" fill="#6b7280">Image not available</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }
    
    throw error;
  }
}

// Network-first strategy for navigation requests
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for navigation, trying cache');
    
    // Try to serve from cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request.url);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await cache.match('/static/index.html');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Ultimate fallback - basic offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - School Website</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .container { 
            max-width: 600px; 
            background: rgba(255,255,255,0.1); 
            padding: 40px; 
            border-radius: 15px; 
            backdrop-filter: blur(10px);
          }
          h1 { margin-bottom: 20px; }
          p { margin-bottom: 30px; line-height: 1.6; }
          button { 
            background: white; 
            color: #667eea; 
            border: none; 
            padding: 12px 30px; 
            border-radius: 25px; 
            cursor: pointer; 
            font-weight: bold;
            transition: transform 0.2s;
          }
          button:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏫 You're Offline</h1>
          <p>It looks like you've lost your internet connection. Some features may not be available until you're back online.</p>
          <p>Try checking your connection and refreshing the page.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Network-first strategy for dynamic requests
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for dynamic request:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         url.includes('/assets/') ||
         url.includes('/css/') ||
         url.includes('/js/');
}

function isSensitiveEndpoint(url) {
  const sensitiveEndpoints = ['/api/auth', '/api/login', '/api/admin', '/api/private'];
  return sensitiveEndpoints.some(endpoint => url.includes(endpoint));
}

// Handle background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get pending form submissions from IndexedDB
  // This would sync forms when connection is restored
  console.log('Service Worker: Performing background sync');
}

// Handle push notifications (for future implementation)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/assets/images/common/logo.png',
      badge: '/assets/images/common/favicon.ico',
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'Open'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' && event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('Service Worker: Script loaded');
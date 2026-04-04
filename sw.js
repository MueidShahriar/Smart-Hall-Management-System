const CACHE_NAME = 'smart-hall-v3';
const OFFLINE_URL = '/index.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/index.css',
  '/scripts/index.js',
  '/images/RSM_Logo.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',

  // Student Pages
  '/pages/student/StudentDashboard.html',
  '/pages/student/About.html',
  '/pages/student/CheckPayments.html',
  '/pages/student/complainbox.html',
  '/pages/student/GuestRoomBooking.html',
  '/pages/student/MealManagement.html',
  '/pages/student/Notices.html',
  '/pages/student/profile.html',

  // Admin Pages
  '/pages/admin/AdminDashboard.html',
  '/pages/admin/Attendance.html',
  '/pages/admin/complaints.html',
  '/pages/admin/DocumentManagement.html',
  '/pages/admin/mealreport.html',
  '/pages/admin/requests.html',
  '/pages/admin/room.html',
  '/pages/admin/StudentInformation.html',

  // Styles
  '/styles/base.css',
  '/styles/StudentDashboard.css',
  '/styles/AdminDashboard.css',
  '/styles/About.css',
  '/styles/DocumentManagement.css',
  '/styles/GuestRoomBooking.css',
  '/styles/MealManagement.css',
  '/styles/Notices.css',

  // Scripts
  '/scripts/preloader.js',
  '/scripts/sidebar.js',
  '/scripts/toast.js',
  '/scripts/StudentDashboard.js',
  '/scripts/AdminDashboard.js',
  '/scripts/About.js',
  '/scripts/DocumentManagement.js',
  '/scripts/GuestRoomBooking.js',
  '/scripts/MealManagement.js',
  '/scripts/Notices.js',
  '/scripts/AdminGuestRoomRequests.js',

  // Images
  '/images/BAUET-Logo.png',
  '/images/hall.jpg',
  '/images/hall.png'
];

// Install event - cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell and assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] Cache install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Firebase and external API calls — always go to network
  if (request.url.includes('firebasejs') ||
      request.url.includes('googleapis.com/identitytoolkit') ||
      request.url.includes('firebaseio.com') ||
      request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then((networkResponse) => {
        // Clone and cache the fresh response
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If it's a navigation request, show the offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

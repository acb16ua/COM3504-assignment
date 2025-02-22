var dataCacheName = 'snipedData-v1';
var cacheName = 'sniped';
var filesToCache = [
    '/',
    '/javascripts/app.js',
    '/javascripts/bootstrap.js',
    '/javascripts/jquery-3.3.1.js',
    '/javascripts/index.js',
    '/stylesheets/style.css',
    '/stylesheets/bootstrap.css',
    '/stylesheets/fontawesome.css',
];


/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});


/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});


/**
 * this is called every time a file is fetched. This is a middleware, i.e. this method is
 * called every time a page is fetched by the browser
 * there are two main branches:
 * /weather_data posts cities names to get data about the weather from the server. if offline, the fetch will fail and the
 *      control will be sent back to Ajax with an error - you will have to recover the situation
 *      from there (e.g. showing the cached data)
 * all the other pages are searched for in the cache. If not found, they are returned
 */



//
// self.addEventListener('fetch', e => {
//     e.respondWith(
//         caches.open(cacheName).then(cache => {
//                 return cache.match(e.request).then(response => {
//                     return response || fetch(e.request)
//                         .then(response => {
//                             const responseClone = response.clone();
//                             cache.put(e.request, responseClone);
//                         })
//                 })
//             }
//         ));
// });




// self.addEventListener('fetch', function (e) {
//     console.log('[Service Worker] Fetch', e.request.url);
//
//     /*
//      * The app is asking for app shell files. In this scenario the app uses the
//      * "Cache, falling back to the network" offline strategy:
//      * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
//      */
//     e.respondWith(
//         caches.match(e.request).then(function (response) {
//             return response
//                 || fetch(e.request)
//                     .then(function (response) {
//                         // note if network error happens, fetch does not return
//                         // an error. it just returns response not ok
//                         // https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
//                         if (!response.ok) {
//                             console.log("error: " + err);
//                         }
//                     })
//                     .catch(function (e) {
//                         console.log("error: " + err);
//                     })
//         })
//     );
//
// });
//
//
//
self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request);
        })
    );
});
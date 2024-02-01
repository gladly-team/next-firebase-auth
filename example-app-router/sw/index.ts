// https://firebase.google.com/docs/auth/web/service-worker-sessions

// Original:
// https://github.com/FirebaseExtended/firebase-auth-service-worker-sessions/blob/master/src/service-worker.js

import { precacheAndRoute } from 'workbox-precaching'
import getIdToken from '@/auth/getIdToken'
import { getOriginFromUrl } from './getOriginFromURL';

export function initializeAuthSW () {
  console.log('Initializing auth service worker.')


  // https://github.com/GoogleChrome/workbox/issues/2519
  precacheAndRoute(self.__WB_MANIFEST);

  const CACHE_NAME = 'cache-v1';
  const urlsToCache = [
    '/',
    '/manifest.json',
    '/config.js',
    '/script.js',
    '/common.js',
    '/style.css'
  ];


  self.addEventListener('install', (event) => {
    // Perform install steps.
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
      // Add all URLs of resources we want to cache.
      return cache.addAll(urlsToCache)
          .catch((error) => {
            // Suppress error as some of the files may not be available for the
            // current page.
          });
    }));
  });

  // As this is a test app, let's only return cached data when offline.
  self.addEventListener('fetch', (event) => {
    console.log('Added event listener for fetch')

    const fetchEvent = event;
    // Get underlying body if available. Works for text and json bodies.
    const getBodyContent = (req) => {
      return Promise.resolve().then(() => {
        if (req.method !== 'GET') {
          if (req.headers.get('Content-Type').indexOf('json') !== -1) {
            return req.json()
              .then((json) => {
                return JSON.stringify(json);
              });
          } else {
            return req.text();
          }
        }
      }).catch((error) => {
        // Ignore error.
      });
    };
    const requestProcessor = (idToken) => {
      console.log('requestProcessor. idToken:', idToken)
        
      let req = event.request;
      let processRequestPromise = Promise.resolve();

      const shouldIncludeToken = self.location.origin === getOriginFromUrl(event.request.url) &&
          (
            self.location.protocol === 'https:' ||
            (
              self.location.protocol.startsWith('http') &&
              self.location.hostname === 'localhost'
            )
          ) &&
          idToken

      // For same origin https requests, append idToken to header.
      if (shouldIncludeToken) {
        // Clone headers as request headers are immutable.
        const headers = new Headers();
        for (let entry of req.headers.entries()) {
          headers.append(entry[0], entry[1]);
        }
        // Add ID token to header. We can't add to Authentication header as it
        // will break HTTP basic authentication.
        headers.append('Authorization', 'Bearer ' + idToken);
        headers.append('X-Example', 'example!');
        processRequestPromise = getBodyContent(req).then((body) => {
          try {
            req = new Request(req.url, {
              method: req.method,
              headers: headers,
              mode: 'same-origin',
              credentials: req.credentials,
              cache: req.cache,
              redirect: req.redirect,
              referrer: req.referrer,
              body,
              bodyUsed: req.bodyUsed,
              context: req.context
            });
          } catch (e) {
            // This will fail for CORS requests. We just continue with the
            // fetch caching logic below and do not pass the ID token.
          }
        });
      }
      return processRequestPromise.then(() => {
        return fetch(req);
      })
      .then((response) => {
        // Check if we received a valid response.
        // If not, just funnel the error response.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // If response is valid, clone it and save it to the cache.
        const responseToCache = response.clone();
        // Save response to cache only for GET requests.
        // Cache Storage API does not support using a Request object whose method is
        // not 'GET'.
        if (req.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(fetchEvent.request, responseToCache);
          });
        }
        // After caching, return response.
        return response;
      })
      .catch((error) => {
        // For fetch errors, attempt to retrieve the resource from cache.
        return caches.match(fetchEvent.request.clone());
      })
      .catch((error) => {
        // If error getting resource from cache, do nothing.
        console.log(error);
      });
    };
    // Try to fetch the resource first after checking for the ID token.
    event.respondWith(getIdToken().then(requestProcessor, requestProcessor));
  });

  self.addEventListener('activate', (event) => {
    // Update this list with all caches that need to remain cached.
    const cacheWhitelist = ['cache-v1'];
    event.waitUntil(caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        // Check if cache is not whitelisted above.
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          // If not whitelisted, delete it.
          return caches.delete(cacheName);
        }
      // Allow active service worker to set itself as the controller for all clients
      // within its scope. Otherwise, pages won't be able to use it until the next
      // load. This makes it possible for the login page to immediately use this.
      })).then(() => clients.claim());
    }));
  });

  console.log('End of SW.')
}
if (typeof window === 'undefined') {
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
const request = event.request;

if (request.cache === 'only-if-cached' &&
    request.mode !== 'same-origin') {
  return;
}

event.respondWith(
  fetch(request)
    .then(response => {
      if (response.status === 0) {
        return response;
      }

      const headers = new Headers(response.headers);

      headers.set(
        'Cross-Origin-Embedder-Policy',
        'require-corp'
      );

      headers.set(
        'Cross-Origin-Opener-Policy',
        'same-origin'
      );

      return new Response(
        response.body,
        {
          status: response.status,
          statusText: response.statusText,
          headers
        }
      );
    })
    .catch(error => {
      console.error(error);
      throw error;
    })
);

});

} else {

(() => {
if (window.crossOriginIsolated) {
return;
}

if (!navigator.serviceWorker) {
  return;
}

navigator.serviceWorker.register(
  './coi-serviceworker.js'
).then(registration => {

  console.log(
    'COI Service Worker registered'
  );

  if (registration.active &&
      !navigator.serviceWorker.controller) {
    window.location.reload();
  }

}).catch(error => {
  console.error(
    'COI Service Worker registration failed',
    error
  );
});

})();
}
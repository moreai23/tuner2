/* ================================================
   チューナー Service Worker
   同じフォルダに tuner.html / manifest.json と
   一緒に置いてください
   ================================================ */

const CACHE_NAME = 'tuner-v1';

/* キャッシュするファイル一覧 */
const PRECACHE = [
  './tuner.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+JP:wght@300;400;500&display=swap',
];

/* インストール時：ファイルをキャッシュ */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* アクティベート時：古いキャッシュを削除 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* フェッチ：キャッシュ優先、なければネット取得してキャッシュ */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        /* 有効なレスポンスだけキャッシュに保存 */
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

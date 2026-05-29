const CACHE = 'jins-bible-v4';
const ASSETS = ['/', '/index.html'];

// 설치: 새 캐시에 핵심 파일 저장
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청: data/ 경로는 캐시 없이 네트워크 직통
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // data/ 폴더 파일 (지도·성경 데이터 등 대용량) → 네트워크 직통, 캐시 저장 안 함
  if (url.pathname.includes('/data/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 나머지: 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

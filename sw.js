const CACHE = 'jins-bible-v4';
const ASSETS = ['/', '/index.html'];

// 설치: 새 캐시에 핵심 파일 저장
self.addEventListener('install', e => {
  self.skipWaiting(); // 즉시 활성화
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // 즉시 모든 탭에 적용
  );
});

// 요청: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', e => {
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

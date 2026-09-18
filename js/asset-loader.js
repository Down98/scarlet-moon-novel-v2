/* 실제로 읽은 파일만 완료 처리합니다. 실패한 항목만 재시도하며 동시 요청 수를 제한합니다. */
(() => {
  'use strict';
  const manifest = [
    ...Object.values(VN_ASSETS.backgrounds).map(({ src }) => ({ src, kind: 'image', label: '배경' })),
    ...[...new Set(Object.values(VN_ASSETS.assets))].map(src => ({ src: `assets/${src}`, kind: 'image', label: '인물' })),
    ...Object.keys(VN_AUDIO_CUES.tracks).map(key => ({ src: `assets/audio/${key}.wav`, key, kind: 'audio', label: '음악' }))
  ];
  const loaded = new Map(), audioSources = new Map();
  let running = false;
  function mediaReady(element, src, event) {
    return new Promise((resolve, reject) => {
      const finish = error => {
        clearTimeout(timer); element.removeEventListener(event, ready); element.removeEventListener('error', failed);
        if (error) { element.removeAttribute('src'); reject(error); } else resolve(element);
      };
      const ready = () => finish();
      const failed = () => finish(new Error('파일을 읽을 수 없습니다.'));
      const timer = setTimeout(() => finish(new Error('연결 대기 시간이 지났습니다.')), 45000);
      element.addEventListener(event, ready, { once: true });
      element.addEventListener('error', failed, { once: true });
      element.src = src;
      if (element instanceof HTMLAudioElement) element.load();
    });
  }
  async function read(item) {
    if (item.kind === 'image') {
      const img = await mediaReady(new Image(), item.src, 'load');
      await img.decode();
      return img;
    }
    let source = item.src, objectUrl;
    // HTTP 음악은 받은 데이터를 재생기에서도 그대로 사용합니다. 파일 직접 열기도 지원합니다.
    if (location.protocol !== 'file:') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(item.src, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        objectUrl = URL.createObjectURL(await response.blob()); source = objectUrl;
      } finally { clearTimeout(timeout); }
    }
    const audio = new Audio(); audio.preload = 'auto';
    try {
      await mediaReady(audio, source, 'canplaythrough');
      audioSources.set(item.key, source);
      return audio;
    } catch (error) { if (objectUrl) URL.revokeObjectURL(objectUrl); throw error; }
  }
  window.VN_PRELOAD = {
    audioSource: key => audioSources.get(key),
    async run(update) {
      if (running) return;
      running = true;
      const queue = manifest.filter(item => !loaded.has(item.src)), failures = [];
      const report = label => update({ total: manifest.length, completed: loaded.size, label, failures: failures.length });
      report('배경 · 인물 · 음악');
      try {
        await Promise.all(Array.from({ length: 4 }, async () => {
          while (queue.length) {
            const item = queue.shift();
            try { loaded.set(item.src, await read(item)); }
            catch { failures.push(item.src); }
            report(item.label);
          }
        }));
        return { total: manifest.length, completed: loaded.size, failures };
      } finally { running = false; }
    }
  };
})();

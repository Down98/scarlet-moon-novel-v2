/* 추방의 격노는 일상적인 경고와 구별합니다. 대사와 저장 위치는 유지합니다. */
(() => {
  const { nodes } = window.VN_STORY;
  const portraits = {
    'mistaken-memory-8': 'furious',
    'mistaken-memory-9': 'furious',
    'expulsion-0': 'remiliaFuryFull',
    'expulsion-1': 'remiliaFuryFull',
    'expulsion-2': 'furious',
    'expulsion-3': 'furious',
    'expulsion-4': 'furious',
    'expulsion-5': 'furious',
    'eviction-order-0': 'remiliaFuryFull',
    'eviction-order-1': 'sakuyaFurious',
    'eviction-order-2': 'sakuyaFurious',
    'eviction-order-3': 'sakuyaFuryFull',
    'eviction-door-0': 'sakuyaFuryFull',
    'eviction-door-1': 'sakuyaFurious',
    'eviction-door-2': 'sakuyaFurious',
    'eviction-door-3': 'sakuyaFurious',
    'eviction-door-4': 'sakuyaFurious',
    'eviction-door-5': 'sakuyaFuryFull'
  };
  for (const [id, portrait] of Object.entries(portraits)) nodes[id].portrait = portrait;
})();

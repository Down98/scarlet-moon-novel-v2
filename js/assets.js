/* 대본의 표정 별칭과 실제 이미지 파일을 연결합니다. */
(() => {
  const assets = {}, portraits = {}, galleryKeys = [];
  for (const { character, folder, frame, variants } of window.VN_PORTRAIT_CATALOG) {
    for (const [file, label, aliases, variantFrame = frame] of variants) {
      galleryKeys.push(aliases[0]);
      for (const key of aliases) {
        assets[key] = `${folder}/cg-v2/${file}.png`;
        portraits[key] = { character, label, frame: variantFrame };
      }
    }
  }
  const squarePortraits = [];
  const backgrounds = window.VN_BACKGROUNDS;
  window.VN_ASSETS = { assets, portraits, squarePortraits, backgrounds, galleryKeys };
})();

(() => {
  const cards = document.getElementById('cards');
  const detail = document.getElementById('detail');
  for (const { character, folder, variants } of window.VN_PORTRAIT_CATALOG) {
    for (const [file, label] of variants) {
      const figure = document.createElement('figure');
      figure.dataset.character = character;
      figure.dataset.expulsion = String(file === 'furious' || file === 'fury-full');
      const button = document.createElement('button'); button.className = 'art';
      const img = document.createElement('img');
      img.src = `../../${folder}/cg-v2/${file}.png`; img.alt = `${character} · ${label}`;
      button.append(img);
      button.addEventListener('click', () => {
        document.getElementById('large').src = img.src;
        document.getElementById('large').alt = img.alt;
        document.getElementById('label').textContent = img.alt;
        detail.showModal();
      });
      const caption = document.createElement('figcaption'); caption.textContent = label;
      const name = document.createElement('small'); name.textContent = character;
      caption.append(name); figure.append(button, caption); cards.append(figure);
    }
  }
  const character = document.getElementById('character');
  function filter() {
    document.body.dataset.view = character.value;
    for (const figure of cards.children) {
      figure.hidden = character.value === 'expulsion'
        ? figure.dataset.expulsion !== 'true'
        : !!character.value && figure.dataset.character !== character.value;
    }
  }
  character.addEventListener('change', filter);
  const initialView = new URLSearchParams(location.search).get('view');
  if ([...character.options].some(option => option.value === initialView)) character.value = initialView;
  filter();
  document.getElementById('tone').addEventListener('change', event => { document.body.dataset.tone = event.target.value; });
  document.getElementById('close').addEventListener('click', () => detail.close());
})();

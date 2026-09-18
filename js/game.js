(() => {
  'use strict';
  const story = window.VN_STORY, storage = window.VN_STORAGE;
  const $ = id => document.getElementById(id);
  const state = { node: story.start, score: 0, period: 'night', flags: {}, history: [], playing: false, auto: false, typing: false, hidden: false };
  let typeTimer, autoTimer, portraitTimer, toastTimer, lastPortrait;
  let settings = { ...storage.data.settings };
  const panel = $('panel');
  const audio = window.VN_AUDIO;
  let refreshAudioPanel;
  function setSound(value) {
    settings.audio = value;
    storage.settings(settings); audio.configure(value);
  }
  function updateSoundButton() {
    const status = audio.status;
    $('sound-toggle').textContent = status.muted ? '♫ 소리 끔' : status.unlocked ? '♫ 소리 켜짐' : '♫ 소리 켜기';
    $('sound-toggle').setAttribute('aria-pressed', String(status.muted));
    $('sound-toggle').setAttribute('aria-label', status.muted || !status.unlocked ? '전체 소리 켜기' : '전체 소리 끄기');
    refreshAudioPanel?.();
  }
  const names = { '레밀리아 스칼렛': 'REMILIA SCARLET', '이자요이 사쿠야': 'SAKUYA IZAYOI', '파츄리 널릿지': 'PATCHOULI KNOWLEDGE', '하쿠레이 레이무': 'REIMU HAKUREI', '레이무 · 속마음': 'REIMU · INNER VOICE', '당신': 'THE STRANGER', '당신 · 속마음': 'INNER VOICE', '': 'SCARLET MOON' };
  const source = key => `assets/${story.assets[key]}`;
  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
  }
  function clearTimers() { clearTimeout(typeTimer); clearTimeout(autoTimer); }
  function setAuto(value) {
    state.auto = value;
    $('auto').setAttribute('aria-pressed', String(value));
    $('auto').querySelector('span').textContent = value ? 'ON' : 'OFF';
    clearTimeout(autoTimer);
    if (value && !state.typing) scheduleAuto();
  }
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (!state.auto || !state.playing || panel.open || state.hidden || document.hidden || story.nodes[state.node].choices) return;
    autoTimer = setTimeout(advance, settings.delay + story.nodes[state.node].text.length * 35);
  }
  function portrait(key, immediate = false) {
    if (lastPortrait === key && !immediate) return;
    const sameImage = key && lastPortrait && story.assets[key] === story.assets[lastPortrait];
    lastPortrait = key;
    clearTimeout(portraitTimer);
    const img = $('portrait');
    img.classList.add('switching');
    const change = () => {
      img.hidden = !key;
      if (key) {
        img.src = source(key);
        img.alt = `${story.portraits[key].character} — ${story.portraits[key].label}`;
        img.classList.toggle('back-pose', key.startsWith('back'));
        img.classList.toggle('square-portrait', story.squarePortraits.includes(key));
        img.classList.toggle('maid-portrait', story.portraits[key].character === '사쿠야');
        img.classList.toggle('full-portrait', key === 'patchouliFull');
        img.classList.toggle('reimu-portrait', story.portraits[key].character === '레이무');
        img.classList.toggle('cg-portrait', !!story.portraits[key].frame);
        img.dataset.frame = story.portraits[key].frame || '';
      }
      img.classList.remove('switching');
    };
    if (immediate || sameImage) change(); else portraitTimer = setTimeout(change, 210);
  }
  function completeLine() {
    clearTimeout(typeTimer);
    state.typing = false;
    const node = story.nodes[state.node];
    $('dialogue-text').textContent = node.text;
    $('next-cue').hidden = !!node.choices;
    if (node.choices) renderChoices(node.choices);
    scheduleAuto();
  }
  function typeLine(text) {
    const chars = Array.from(text);
    let index = 0;
    state.typing = true;
    $('dialogue-text').textContent = '';
    $('next-cue').hidden = true;
    if (settings.speed === 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return completeLine();
    const tick = () => {
      if (index >= chars.length) return completeLine();
      const char = chars[index++];
      $('dialogue-text').textContent += char;
      if (!state.hidden && !panel.open) audio.text(story.nodes[state.node].speaker, char, index);
      typeTimer = setTimeout(tick, settings.speed * (/[.?!…]/.test(char) ? 4 : 1));
    };
    tick();
  }
  function renderChoices(choices) {
    const container = $('choices');
    container.replaceChildren();
    const prompt = document.createElement('p');
    prompt.className = 'choice-prompt'; prompt.textContent = '당신의 마음은 어느 쪽인가요?';
    container.append(prompt);
    const choiceNode = state.node;
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      const number = document.createElement('span');
      number.className = 'choice-number'; number.textContent = `0${index + 1}`;
      const label = document.createElement('span'); label.textContent = choice.text;
      button.append(number, label);
      button.addEventListener('click', () => {
        if (state.node !== choiceNode || state.hidden || panel.open) return;
        audio.effect('choice');
        state.score += choice.points;
        Object.assign(state.flags, choice.flags || {});
        state.history.push({ speaker: '당신 · 선택', text: choice.text });
        showNode(choice.next);
        $('dialogue').focus({ preventScroll: true });
      });
      container.append(button);
    });
    container.hidden = state.hidden;
  }
  function showNode(id, restoring = false) {
    clearTimers();
    id = story.resolve(id, state.score, state.flags);
    state.node = id;
    const node = story.nodes[id];
    if (node.period) state.period = node.period;
    audio.scene(node, restoring);
    $('app').classList.toggle('sky-shot', node.framing === 'sky');
    $('app').classList.toggle('dark-scene', node.backdrop === 'dark');
    $('app').classList.toggle('room-unease', node.effect === 'red-glimpse');
    for (const effect of ['memory-haze', 'time-fracture', 'scarlet-seal']) $('app').classList.toggle(effect, node.effect === effect);
    const backgroundKey = window.VN_BACKGROUND.resolve(node.background || 'hall', state.period);
    window.VN_BACKGROUND.show(backgroundKey, restoring);
    $('location').textContent = node.location || story.backgrounds[backgroundKey].location;
    $('choices').hidden = true;
    $('choices').replaceChildren();
    $('chapter').textContent = node.chapterTitle || story.chapters[node.chapter];
    $('chapter-number').textContent = node.chapterNumber || `0${node.chapter + 1}`;
    $('speaker').textContent = node.speaker || node.narrator || (node.background === 'distant' ? '길 잃은 밤' : '홍마관의 밤');
    $('speaker-sub').textContent = names[node.speaker];
    $('accessible-line').textContent = `${node.speaker || '내레이션'}. ${node.text}`;
    window.VN_ENTRANCE.show(node, restoring);
    portrait(node.portrait, restoring);
    if (!restoring) state.history.push({ speaker: node.speaker || '내레이션', text: node.text });
    storage.save(state);
    typeLine(node.text);
  }
  function advance() {
    if (!state.playing || panel.open || state.hidden) return;
    if (state.typing) { audio.effect('advance'); return completeLine(); }
    const node = story.nodes[state.node];
    if (node.choices) return;
    audio.effect('advance');
    if (node.ending) return end(node.ending);
    if (node.next) showNode(node.next);
  }
  function enterGame(saved) {
    clearTimers(); setAuto(false);
    state.playing = true; state.score = saved?.score || 0;
    state.flags = { ...saved?.flags };
    state.period = saved?.period || 'night';
    state.history = saved ? saved.history.map(x => ({ ...x })) : [];
    state.hidden = false;
    $('app').className = 'app game-mode';
    $('title-screen').hidden = $('title-caption').hidden = $('title-footer').hidden = true;
    $('game-screen').hidden = false; $('ending-screen').hidden = true;
    $('dialogue-wrap').hidden = false; $('restore-ui').hidden = true;
    $('portrait').classList.remove('title-portrait');
    showNode(saved?.node || story.start, !!saved);
    $('dialogue').focus({ preventScroll: true });
    if (!storage.available) toast('브라우저 저장소가 제한되어 있습니다. 이번 창에서만 기록을 유지합니다.');
  }
  function home() {
    audio.stopSceneEffects();
    clearTimers(); setAuto(false); state.playing = false;
    $('app').className = 'app title-mode';
    $('title-screen').hidden = $('title-caption').hidden = $('title-footer').hidden = false;
    $('game-screen').hidden = $('ending-screen').hidden = true;
    $('portrait').classList.add('title-portrait');
    window.VN_ENTRANCE.reset();
    window.VN_BACKGROUND.show('hall', true);
    audio.music('moon');
    portrait('normal', true);
    $('continue').disabled = !storage.data.auto;
    $('start').focus({ preventScroll: true });
  }
  function end(id) {
    audio.stopSceneEffects();
    clearTimers(); setAuto(false); state.playing = false;
    const ending = story.endings[id]; storage.ending(id);
    $('app').classList.toggle('sky-finale', !!ending.continued);
    $('ending-continuation').hidden = !ending.continued;
    audio.music(ending.bad ? 'exile' : 'departure');
    $('game-screen').hidden = true;
    $('ending-screen').hidden = false;
    $('ending-label').textContent = `${ending.bad ? 'BAD END' : 'ENDING'} ${ending.number} · ${storage.data.endings.length} / ${Object.keys(story.endings).length} DISCOVERED`;
    $('ending-title').textContent = ending.title;
    $('ending-description').textContent = ending.description;
    $('ending-note').textContent = ending.note;
    $('ending-screen').classList.toggle('bad-ending', !!ending.bad);
    $('restart').focus({ preventScroll: true });
  }
  function hideUI(value) {
    if (!state.playing || panel.open) return;
    state.hidden = value;
    $('dialogue-wrap').hidden = value;
    $('choices').hidden = value || !story.nodes[state.node].choices || state.typing;
    $('restore-ui').hidden = !value;
    if (value) { clearTimeout(autoTimer); $('restore-ui').focus({ preventScroll: true }); }
    else { scheduleAuto(); $('dialogue').focus({ preventScroll: true }); }
  }
  function openPanel(kind) {
    clearTimeout(autoTimer);
    refreshAudioPanel = null;
    const content = $('panel-content'); content.replaceChildren();
    const titles = { settings: '환경 설정', gallery: '표정 갤러리', log: '지난 대화', save: '이 밤을 기억하기', load: '기억 불러오기' };
    $('panel-title').textContent = titles[kind];
    if (kind === 'settings') {
      content.innerHTML = '<p class="panel-description">당신의 속도로, 이 밤을 읽어 주세요.</p><div class="setting-row"><label for="text-speed">글자 표시 속도<small id="speed-value"></small></label><input id="text-speed" type="range" min="0" max="65" step="5"></div><div class="setting-row"><label for="auto-delay">자동 진행 대기 시간<small id="delay-value"></small></label><input id="auto-delay" type="range" min="1500" max="6000" step="500"></div><div class="shortcut-list"><span><kbd>Space / Enter</kbd>대화 진행</span><span><kbd>A</kbd>자동 진행</span><span><kbd>H</kbd>대화창 숨기기</span><span><kbd>Esc</kbd>창 닫기 / 대화창 표시</span></div><p class="panel-description">대화 도중 한 번 누르면 문장이 즉시 표시됩니다. 선택지는 직접 골라 주세요.<br>장면별 오리지널 음악과 효과음이 함께하는 단편입니다. 인물 음성 더빙은 없습니다.</p>';
      $('text-speed').value = 65 - settings.speed;
      $('auto-delay').value = settings.delay;
      const labels = () => { $('speed-value').textContent = settings.speed === 0 ? '즉시 표시' : `${settings.speed}ms / 글자 · 오른쪽으로 갈수록 빠르게`; $('delay-value').textContent = `${(settings.delay / 1000).toFixed(1)}초 + 문장 길이에 따른 읽기 시간`; };
      labels();
      $('text-speed').addEventListener('input', e => { settings.speed = 65 - Number(e.target.value); storage.settings(settings); labels(); });
      $('auto-delay').addEventListener('input', e => { settings.delay = Number(e.target.value); storage.settings(settings); labels(); });
    }
    if (kind === 'gallery') {
      const description = document.createElement('p'); description.className = 'panel-description'; description.textContent = `레밀리아, 사쿠야, 파츄리, 레이무의 ${window.VN_ASSETS.galleryKeys.length}가지 모습. 이야기에서 만나게 될 표정과 전신 CG가 포함되어 있습니다.`; content.append(description);
      const galleries = {};
      for (const character of [...new Set(Object.values(story.portraits).map(item => item.character))]) {
        const heading = document.createElement('h3'); heading.className = 'gallery-heading'; heading.textContent = character;
        const gallery = document.createElement('div'); gallery.className = 'gallery'; gallery.setAttribute('aria-label', `${character} 표정`);
        galleries[character] = gallery; content.append(heading, gallery);
      }
      window.VN_ASSETS.galleryKeys.forEach(key => {
        const figure = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption');
        const info = story.portraits[key];
        img.src = source(key); img.alt = `${info.character} — ${info.label}`; img.loading = 'lazy'; caption.textContent = info.label;
        figure.append(img, caption); galleries[info.character].append(figure);
      });
    }
    if (kind === 'log') {
      state.history.forEach(entry => {
        const article = document.createElement('article'), heading = document.createElement('h3'), text = document.createElement('p');
        article.className = 'log-entry'; heading.textContent = entry.speaker; text.textContent = entry.text; article.append(heading, text); content.append(article);
      });
    }
    if (kind === 'save' || kind === 'load') {
      const description = document.createElement('p'); description.className = 'panel-description';
      description.textContent = storage.available ? '이 브라우저에 저장됩니다. 자동 저장은 대화마다 갱신되며, 수동 저장은 아래 세 칸에 따로 남길 수 있습니다.' : '현재 영구 저장이 제한되어 있습니다. 이 창을 닫으면 저장 기록이 사라질 수 있습니다.';
      content.append(description);
      const slots = kind === 'load' ? [['auto', storage.data.auto], ...storage.data.slots.map((x, i) => [i, x])] : storage.data.slots.map((x, i) => [i, x]);
      slots.forEach(([index, saved]) => {
        const button = document.createElement('button'); button.className = 'save-slot';
        const number = document.createElement('span'); number.className = 'slot-number'; number.textContent = index === 'auto' ? 'A' : `0${index + 1}`;
        const info = document.createElement('span'); info.className = 'slot-info';
        const title = document.createElement('strong'), detail = document.createElement('small');
        title.textContent = saved ? (story.nodes[saved.node].chapterTitle || story.chapters[story.nodes[saved.node].chapter]) : '아직 기록되지 않은 밤';
        detail.textContent = saved ? `${index === 'auto' ? '자동 저장 · ' : ''}${new Date(saved.date).toLocaleString('ko-KR')} · ${story.nodes[saved.node].text.slice(0, 27)}…` : kind === 'save' ? '이곳에 현재 이야기를 저장합니다' : '비어 있는 저장 공간';
        info.append(title, detail); button.append(number, info); button.disabled = kind === 'load' && !saved;
        let confirming = false;
        button.addEventListener('click', () => {
          if (kind === 'load') { panel.close(); enterGame(saved); toast('기억을 불러왔습니다.'); }
          else if (saved && !confirming) { confirming = true; title.textContent = '기존 기록을 덮어쓸까요? 한 번 더 누르면 저장합니다.'; }
          else { const persisted = storage.save(state, index); audio.effect('save'); panel.close(); toast(persisted ? '이 밤을 기억해 두었습니다.' : '이번 창에만 저장했습니다. 영구 저장은 사용할 수 없습니다.'); }
        }); content.append(button);
      });
    }
    if (kind === 'settings') refreshAudioPanel = window.VN_AUDIO_PANEL.mount(content, () => settings.audio, setSound);
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
    if (kind === 'log') content.lastElementChild?.scrollIntoView({ block: 'end' });
  }
  $('start').addEventListener('click', () => enterGame());
  $('sound-toggle').addEventListener('click', () => { const wasUnlocked = audio.status.unlocked; audio.unlock(); setSound({ ...settings.audio, muted: wasUnlocked ? !settings.audio.muted : false }); });
  document.addEventListener('vn-audio-change', updateSoundButton);
  document.addEventListener('vn-audio-error', event => toast(event.detail));
  updateSoundButton();
  $('continue').addEventListener('click', () => { if (storage.data.auto) enterGame(storage.data.auto); });
  $('dialogue').addEventListener('click', advance);
  $('auto').addEventListener('click', () => setAuto(!state.auto));
  $('home').addEventListener('click', home);
  $('restart').addEventListener('click', () => enterGame());
  $('ending-home').addEventListener('click', home);
  $('hide-ui').addEventListener('click', () => hideUI(true));
  $('restore-ui').addEventListener('click', () => hideUI(false));
  $('close-panel').addEventListener('click', () => panel.close());
  panel.addEventListener('close', scheduleAuto);
  panel.addEventListener('click', e => { const rect = panel.getBoundingClientRect(); if (e.target === panel && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) panel.close(); });
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
  $('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('app').requestFullscreen(); }
    catch { toast('이 브라우저에서는 전체 화면을 사용할 수 없습니다.'); }
  });
  document.addEventListener('keydown', e => {
    if (panel.open || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape' && state.hidden) { hideUI(false); return; }
    if (!state.playing || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key.toLowerCase() === 'a') { e.preventDefault(); setAuto(!state.auto); }
    if (e.key.toLowerCase() === 'h') { e.preventDefault(); hideUI(!state.hidden); }
    if (e.code === 'Space' || e.key === 'Enter') {
      if (e.target.closest('button') && e.target.id !== 'dialogue') return;
      e.preventDefault(); if (state.hidden) hideUI(false); else advance();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(autoTimer); else scheduleAuto(); });
  $('portrait').addEventListener('error', () => toast('캐릭터 이미지를 읽지 못했습니다. assets 폴더를 확인해 주세요.'));
  $('continue').disabled = !storage.data.auto;
})();

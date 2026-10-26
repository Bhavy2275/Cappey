(() => {
  const track = document.querySelector('#elevatorExperience');
  const stage = track?.querySelector('.elevator-film-stage');
  const canvas = stage?.querySelector('.elevator-film-canvas');
  const progressBar = stage?.querySelector('.elevator-film-progress span');
  const moments = [...(stage?.querySelectorAll('[data-film-moment]') || [])];
  const liveRegion = stage?.querySelector('.elevator-film-sr-only');
  const context = canvas?.getContext('2d', { alpha: false });

  if (!track || !stage || !canvas || !context || moments.length === 0) return;

  const frameCount = 120;
  const cacheLimit = 7;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  const loading = new Map();
  let desiredFrame = 1;
  let lastDrawnFrame = 0;
  let activeMoment = -1;
  let scheduled = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const frameUrl = index => `assets/frames/frame_${String(index).padStart(3, '0')}.webp`;

  function drawFrame(index, image) {
    if (index !== desiredFrame) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.max(1, Math.round(stage.clientWidth * pixelRatio));
    const targetHeight = Math.max(1, Math.round(stage.clientHeight * pixelRatio));
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      lastDrawnFrame = 0;
    }
    if (index === lastDrawnFrame) return;

    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = targetWidth / targetHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    if (sourceRatio < targetRatio) {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    } else {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    stage.classList.add('is-ready');
    lastDrawnFrame = index;
  }

  function trimCache() {
    while (cache.size > cacheLimit) {
      const oldest = cache.keys().next().value;
      if (oldest === desiredFrame) {
        const image = cache.get(oldest);
        cache.delete(oldest);
        cache.set(oldest, image);
        continue;
      }
      cache.delete(oldest);
    }
  }

  function loadFrame(index) {
    const cached = cache.get(index);
    if (cached) {
      cache.delete(index);
      cache.set(index, cached);
      drawFrame(index, cached);
      return;
    }
    if (loading.has(index)) return;

    const image = new Image();
    image.decoding = 'async';
    loading.set(index, image);
    image.onload = () => {
      loading.delete(index);
      cache.set(index, image);
      trimCache();
      drawFrame(index, image);
    };
    image.onerror = () => loading.delete(index);
    image.src = frameUrl(index);
  }

  function updateMoment(progress) {
    const nextMoment = Math.min(moments.length - 1, Math.floor(progress * moments.length));
    if (nextMoment === activeMoment) return;
    activeMoment = nextMoment;
    moments.forEach((moment, index) => {
      const active = index === activeMoment;
      moment.classList.toggle('is-current', active);
      moment.setAttribute('aria-hidden', String(!active));
    });
    if (liveRegion) liveRegion.textContent = moments[activeMoment].querySelector('h2')?.textContent || '';
  }

  function render() {
    scheduled = false;
    if (reducedMotion.matches) return;

    const travel = Math.max(1, track.offsetHeight - stage.clientHeight);
    const progress = clamp(-track.getBoundingClientRect().top / travel, 0, 1);
    desiredFrame = Math.round(progress * (frameCount - 1)) + 1;

    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    updateMoment(progress);
    loadFrame(desiredFrame);
    loadFrame(Math.min(frameCount, desiredFrame + 1));
    loadFrame(Math.max(1, desiredFrame - 1));
  }

  function requestRender() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(render);
  }

  if (reducedMotion.matches) return;

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  reducedMotion.addEventListener?.('change', requestRender);
  requestRender();
})();

(() => {
  const track = document.getElementById('homeHero');
  const stage = track?.querySelector('.story-stage');
  const ground = track?.querySelector('.story-ground');
  const copy = track?.querySelector('.story-copy');
  const visual = track?.querySelector('.story-visual');
  const wordmark = track?.querySelector('.story-wordmark');
  const services = track?.querySelector('.story-services');

  if (!track || !stage || !ground || !services) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCompact = window.matchMedia('(max-width: 900px)');
  let frame = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const ease = value => value * value * (3 - 2 * value);

  function render() {
    frame = 0;
    if (!track.classList.contains('story-animated')) return;
    const travel = Math.max(1, track.offsetHeight - stage.clientHeight);
    const progress = clamp(-track.getBoundingClientRect().top / travel, 0, 1);
    const serviceProgress = ease(clamp((progress - 0.28) / 0.58, 0, 1));
    const copyOpacity = 1 - ease(clamp((progress - 0.14) / 0.24, 0, 1));

    ground.style.height = `${17 + progress * 42}%`;
    services.style.transform = `translateX(${(1 - serviceProgress) * 105}%)`;
    services.style.opacity = `${serviceProgress}`;
    services.inert = serviceProgress < 0.12;
    if (copy) copy.style.opacity = `${copyOpacity}`;
    if (visual) {
      visual.style.opacity = `${1 - ease(clamp((progress - 0.2) / 0.27, 0, 1))}`;
      visual.style.transform = `translateY(${-progress * 4}vh)`;
    }
    if (wordmark) wordmark.style.transform = `translateX(${-progress * 13}vw)`;
  }

  function requestRender() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function updateMode() {
    if (prefersReducedMotion.matches || isCompact.matches) {
      track.classList.remove('story-animated');
      ground.style.removeProperty('height');
      services.style.removeProperty('transform');
      services.style.removeProperty('opacity');
      copy?.style.removeProperty('opacity');
      visual?.style.removeProperty('opacity');
      visual?.style.removeProperty('transform');
      wordmark?.style.removeProperty('transform');
      services.inert = false;
      return;
    }
    track.classList.add('story-animated');
    requestRender();
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  prefersReducedMotion.addEventListener?.('change', updateMode);
  isCompact.addEventListener?.('change', updateMode);
  updateMode();
})();

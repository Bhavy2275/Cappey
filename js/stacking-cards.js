(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 760px), (max-height: 700px)');
  const roots = [...document.querySelectorAll('[data-stacking-cards]')];
  if (!roots.length) return;

  const update = () => {
    const disabled = reduceMotion.matches || smallScreen.matches;
    roots.forEach((root) => {
      const cards = [...root.querySelectorAll('[data-stacking-card]')];
      cards.forEach((card, index) => {
        card.style.setProperty('--stack-index', index);
        card.style.setProperty('--stack-offset', `${index * 14}px`);
        card.style.zIndex = String(index + 1);
        if (disabled || cards.length < 2) {
          card.style.setProperty('--stack-scale', '1');
          return;
        }
        const bounds = root.getBoundingClientRect();
        const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -bounds.top / scrollable));
        const start = index / cards.length;
        const localProgress = Math.min(1, Math.max(0, (progress - start) / Math.max(.001, 1 - start)));
        const finalScale = 1 - (cards.length - index - 1) * .018;
        card.style.setProperty('--stack-scale', String(1 - (1 - finalScale) * localProgress));
      });
    });
  };

  let frame = 0;
  const scheduleUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  reduceMotion.addEventListener?.('change', scheduleUpdate);
  smallScreen.addEventListener?.('change', scheduleUpdate);
  update();
})();

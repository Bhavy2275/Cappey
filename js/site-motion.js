(() => {
  const start = () => {
    const page = document.body;
    if (!page || page.classList.contains('mobile-page')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = page.querySelector('.story-copy, .hero-wrapper .hero-content');
    hero?.classList.add('motion-hero-enter');

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const targets = [
      ...page.querySelectorAll(':scope > section:not(.hero-wrapper):not(.story-track):not(.elevator-film-track), main > section:not(.hero-wrapper):not(.story-track):not(.elevator-film-track), footer.cappey-footer'),
      ...page.querySelectorAll('main .dual-card, main .founder-placeholder, main .founder-card, body > .story-track .dual-card'),
      ...page.querySelectorAll('body > .section-pad, body > .stats-ribbon, body > .dual-card'),
    ];
    const uniqueTargets = [...new Set(targets)];
    if (!uniqueTargets.length) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    uniqueTargets.forEach((target, index) => {
      target.classList.add('motion-reveal');
      target.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 80}ms`);
      observer.observe(target);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

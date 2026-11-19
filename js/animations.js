/**
 * Vivian Batistela Advogada - animations.js
 * Entrada sutil do hero usando apenas CSS, sem bibliotecas externas.
 */

(() => {
  const hero = document.querySelector('.hero-home');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hero || reduceMotion) return;

  hero.classList.add(
    window.matchMedia('(max-width: 1024px)').matches
      ? 'hero-animado-mobile'
      : 'hero-animado'
  );
})();

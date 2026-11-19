/**
 * Bootstrap critico do menu mobile.
 * Executa logo apos o header para que o primeiro toque nao dependa do
 * carregamento completo do bundle principal.
 */
(() => {
  const header = document.querySelector('.site-header');
  const btnToggle = document.querySelector('.btn-mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!header || !btnToggle || !navMenu) return;

  navMenu.id = navMenu.id || 'main-menu';
  btnToggle.type = 'button';
  btnToggle.setAttribute('aria-controls', navMenu.id);

  let navOverlay = document.querySelector('.nav-overlay');
  if (!navOverlay) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(navOverlay, header.nextSibling);
  }

  const setOpen = (isOpen) => {
    btnToggle.classList.toggle('ativo', isOpen);
    btnToggle.setAttribute('aria-expanded', String(isOpen));
    btnToggle.setAttribute(
      'aria-label',
      isOpen ? 'Fechar menu de navega\u00e7\u00e3o' : 'Abrir menu de navega\u00e7\u00e3o'
    );
    navMenu.classList.toggle('aberto', isOpen);
    navOverlay.classList.toggle('ativo', isOpen);
    navOverlay.setAttribute('aria-hidden', String(!isOpen));
    document.documentElement.classList.toggle('menu-travado', isOpen);
  };

  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!navMenu.classList.contains('aberto'));
  };

  let lastTouchActivation = 0;
  btnToggle.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      lastTouchActivation = performance.now();
      toggleMenu(event);
    }
  }, { passive: false });

  btnToggle.addEventListener('click', (event) => {
    if (performance.now() - lastTouchActivation < 500) return;
    toggleMenu(event);
  });

  navOverlay.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('aberto')) {
      setOpen(false);
      btnToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navMenu.classList.contains('aberto')) {
      setOpen(false);
    }
  }, { passive: true });

  window.__menuCritical = true;
})();

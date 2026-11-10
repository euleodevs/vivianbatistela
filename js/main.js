/**
 * Vivian Batistela Advogada - main.js
 * Funcionalidades essenciais do site, incluindo o menu mobile.
 */

(() => {
  // 1. Controle do header no scroll
  const header = document.querySelector('.site-header');
  if (header) {
    let headerTicking = false;
    const handleScroll = () => {
      if (!headerTicking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 40);
          headerTicking = false;
        });
        headerTicking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Menu mobile: inicializado imediatamente, sem esperar as bibliotecas de animação
  const btnToggle = document.querySelector('.btn-mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  let navOverlay = document.querySelector('.nav-overlay');
  let lastFocusedElement = null;

  if (!navOverlay && header) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(navOverlay, header.nextSibling);
  }

  if (btnToggle && navMenu) {
    const isMobileNav = () => window.innerWidth <= 1024;
    const hasCriticalMenu = window.__menuCritical === true;

    navMenu.id = navMenu.id || 'main-menu';
    btnToggle.type = 'button';
    btnToggle.setAttribute('aria-controls', navMenu.id);

    // Cria o controle do submenu sem duplicar a marcação em todas as páginas estáticas.
    navMenu.querySelectorAll('.nav-item-has-submenu').forEach((item, index) => {
      const submenu = item.querySelector('.nav-submenu');
      const link = item.querySelector('.nav-link');
      if (!submenu || !link || item.querySelector('.submenu-toggle')) return;

      submenu.id = submenu.id || `submenu-${index + 1}`;
      const label = link.textContent.replace('expand_more', '').trim();
      const submenuToggle = document.createElement('button');
      submenuToggle.type = 'button';
      submenuToggle.className = 'submenu-toggle';
      submenuToggle.setAttribute('aria-expanded', 'false');
      submenuToggle.setAttribute('aria-controls', submenu.id);
      submenuToggle.setAttribute('aria-label', `Expandir submenu ${label}`);
      submenuToggle.innerHTML = '<svg class="submenu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      item.insertBefore(submenuToggle, submenu);
    });

    const updateSubmenuState = (item, isOpen) => {
      const toggle = item.querySelector('.submenu-toggle');
      item.classList.toggle('submenu-aberto', isOpen);
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute(
          'aria-label',
          isOpen ? 'Recolher submenu Áreas de Atuação' : 'Expandir submenu Áreas de Atuação'
        );
      }
    };

    const closeMenu = (restoreFocus = false) => {
      btnToggle.setAttribute('aria-expanded', 'false');
      btnToggle.setAttribute('aria-label', 'Abrir menu de navegação');
      btnToggle.classList.remove('ativo');
      navMenu.classList.remove('aberto');

      if (navOverlay) {
        navOverlay.classList.remove('ativo');
        navOverlay.setAttribute('aria-hidden', 'true');
      }

      navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
        updateSubmenuState(item, false);
      });

      // Mantém o drawer rolável e bloqueia apenas o fundo da página.
      document.documentElement.classList.remove('menu-travado');

      if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    };

    const openMenu = () => {
      lastFocusedElement = document.activeElement;
      btnToggle.setAttribute('aria-expanded', 'true');
      btnToggle.setAttribute('aria-label', 'Fechar menu de navegação');
      btnToggle.classList.add('ativo');
      navMenu.classList.add('aberto');

      if (navOverlay) {
        navOverlay.classList.add('ativo');
        navOverlay.setAttribute('aria-hidden', 'false');
      }

      document.documentElement.classList.add('menu-travado');
    };

    const activateMenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (navMenu.classList.contains('aberto')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    // pointerup evita a espera do click sintético em alguns navegadores móveis.
    if (!hasCriticalMenu) {
      let lastTouchActivation = 0;
      btnToggle.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') {
          lastTouchActivation = performance.now();
          activateMenu(event);
        }
      }, { passive: false });
      btnToggle.addEventListener('click', (event) => {
        if (performance.now() - lastTouchActivation < 500) return;
        activateMenu(event);
      });
    }

    if (navOverlay) {
      if (!hasCriticalMenu) {
        navOverlay.addEventListener('click', () => closeMenu());
      }
      navOverlay.addEventListener('touchmove', (event) => {
        event.preventDefault();
      }, { passive: false });
    }

    // Tanto no desktop quanto no mobile, o texto e a setinha controlam o submenu.
    navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
      const submenuToggle = item.querySelector('.submenu-toggle');
      const submenuLink = item.querySelector('.nav-link');
      const toggleSubmenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !item.classList.contains('submenu-aberto');
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(otherItem => {
          if (otherItem !== item) updateSubmenuState(otherItem, false);
        });
        updateSubmenuState(item, willOpen);
        if (!willOpen && !isMobileNav() && submenuLink) submenuLink.blur();
      };

      if (submenuToggle) {
        submenuToggle.addEventListener('click', toggleSubmenu);
      }
      if (submenuLink) {
        submenuLink.addEventListener('click', toggleSubmenu);
      }
    });

    navMenu.querySelectorAll('.nav-submenu-link, .nav-menu > li > .nav-link').forEach(link => {
      if (link.classList.contains('nav-link') && link.closest('.nav-item-has-submenu')) return;
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('aberto')) {
        closeMenu(true);
      } else if (event.key === 'Escape') {
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
          updateSubmenuState(item, false);
        });
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-item-has-submenu')) {
        navMenu.querySelectorAll('.nav-item-has-submenu').forEach(item => {
          updateSubmenuState(item, false);
        });
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('aberto')) {
        closeMenu();
      }
    }, { passive: true });
  }

  // 3. Suporte acessível a detalhes de FAQ
  const faqs = [...document.querySelectorAll('.faq-item')];
  const faqAnimationDuration = 300;
  const faqAnimationEasing = 'cubic-bezier(0.25, 1, 0.5, 1)';
  let faqTransitioning = false;

  const faqPrefersReducedMotion = () => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const clearFaqAnimationStyles = (answer) => {
    answer.style.removeProperty('height');
    answer.style.removeProperty('overflow');
    answer.style.removeProperty('opacity');
    answer.style.removeProperty('padding-top');
    answer.style.removeProperty('padding-bottom');
    answer.style.removeProperty('transition');
  };

  const waitForFaqTransition = (answer, duration) => new Promise(resolve => {
    if (!duration) {
      resolve();
      return;
    }

    let finished = false;
    let timeoutId;
    const finish = () => {
      if (finished) return;
      finished = true;
      answer.removeEventListener('transitionend', handleTransitionEnd);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const handleTransitionEnd = event => {
      if (event.target === answer && event.propertyName === 'height') finish();
    };

    answer.addEventListener('transitionend', handleTransitionEnd);
    timeoutId = window.setTimeout(finish, duration + 80);
  });

  const animateFaqOpen = faq => {
    const answer = faq.querySelector('.faq-resposta');
    const summary = faq.querySelector('.faq-pergunta');
    if (!answer || !summary) return Promise.resolve();

    const duration = faqPrefersReducedMotion() ? 0 : faqAnimationDuration;
    const computedStyle = window.getComputedStyle(answer);
    const paddingTop = computedStyle.paddingTop;
    const paddingBottom = computedStyle.paddingBottom;

    faq.open = true;
    summary.setAttribute('aria-expanded', 'true');
    const targetHeight = answer.scrollHeight;

    answer.style.overflow = 'hidden';
    answer.style.height = '0px';
    answer.style.opacity = '0';
    answer.style.paddingTop = '0px';
    answer.style.paddingBottom = '0px';
    answer.style.transition = duration
      ? `height ${duration}ms ${faqAnimationEasing}, opacity ${duration}ms ease, padding-top ${duration}ms ${faqAnimationEasing}, padding-bottom ${duration}ms ${faqAnimationEasing}`
      : 'none';

    void answer.offsetHeight;

    if (!duration) {
      answer.style.height = 'auto';
      answer.style.opacity = '1';
      answer.style.paddingTop = paddingTop;
      answer.style.paddingBottom = paddingBottom;
      clearFaqAnimationStyles(answer);
      return Promise.resolve();
    }

    window.requestAnimationFrame(() => {
      answer.style.height = `${targetHeight}px`;
      answer.style.opacity = '1';
      answer.style.paddingTop = paddingTop;
      answer.style.paddingBottom = paddingBottom;
    });

    return waitForFaqTransition(answer, duration).then(() => {
      clearFaqAnimationStyles(answer);
    });
  };

  const animateFaqClose = faq => {
    const answer = faq.querySelector('.faq-resposta');
    const summary = faq.querySelector('.faq-pergunta');
    if (!answer || !summary) return Promise.resolve();

    const duration = faqPrefersReducedMotion() ? 0 : faqAnimationDuration;
    const computedStyle = window.getComputedStyle(answer);
    const paddingTop = computedStyle.paddingTop;
    const paddingBottom = computedStyle.paddingBottom;
    const currentHeight = answer.scrollHeight;

    answer.style.overflow = 'hidden';
    answer.style.height = `${currentHeight}px`;
    answer.style.opacity = '1';
    answer.style.paddingTop = paddingTop;
    answer.style.paddingBottom = paddingBottom;
    answer.style.transition = duration
      ? `height ${duration}ms ${faqAnimationEasing}, opacity ${duration}ms ease, padding-top ${duration}ms ${faqAnimationEasing}, padding-bottom ${duration}ms ${faqAnimationEasing}`
      : 'none';

    void answer.offsetHeight;

    if (!duration) {
      faq.open = false;
      summary.setAttribute('aria-expanded', 'false');
      clearFaqAnimationStyles(answer);
      return Promise.resolve();
    }

    window.requestAnimationFrame(() => {
      answer.style.height = '0px';
      answer.style.opacity = '0';
      answer.style.paddingTop = '0px';
      answer.style.paddingBottom = '0px';
    });

    return waitForFaqTransition(answer, duration).then(() => {
      faq.open = false;
      summary.setAttribute('aria-expanded', 'false');
      clearFaqAnimationStyles(answer);
    });
  };

  const toggleFaq = async faq => {
    if (faqTransitioning) return;
    faqTransitioning = true;

    try {
      if (faq.open) {
        await animateFaqClose(faq);
      } else {
        for (const otherFaq of faqs) {
          if (otherFaq !== faq && otherFaq.open) await animateFaqClose(otherFaq);
        }
        await animateFaqOpen(faq);
      }
    } finally {
      faqTransitioning = false;
    }
  };

  faqs.forEach(faq => {
    const summary = faq.querySelector('.faq-pergunta');
    if (!summary) return;

    summary.setAttribute('aria-expanded', faq.open ? 'true' : 'false');
    summary.addEventListener('click', event => {
      event.preventDefault();
      toggleFaq(faq);
    });
  });

  // 4. Controle de visibilidade do WhatsApp flutuante
  const wppFloat = document.querySelector('.whatsapp-float');
  const heroSection = document.querySelector('.hero-home') || document.querySelector('.servico-hero');
  if (wppFloat) {
    let heroThreshold = 300;
    const updateThreshold = () => {
      if (heroSection) heroThreshold = heroSection.offsetTop + heroSection.offsetHeight - 120;
    };
    updateThreshold();
    window.addEventListener('resize', updateThreshold, { passive: true });

    let wppTicking = false;
    const handleWppVisibility = () => {
      if (!wppTicking) {
        window.requestAnimationFrame(() => {
          wppFloat.classList.toggle('visivel', window.scrollY > heroThreshold);
          wppTicking = false;
        });
        wppTicking = true;
      }
    };
    window.addEventListener('scroll', handleWppVisibility, { passive: true });
    handleWppVisibility();
  }

  document.documentElement.classList.add('js-loaded');
})();
